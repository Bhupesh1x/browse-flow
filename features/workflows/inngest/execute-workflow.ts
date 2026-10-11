import { z } from "zod"
import * as toposort from "toposort"
import { Stagehand } from "@browserbasehq/stagehand"
import { eventType, NonRetriableError } from "inngest"

import { inngest } from "@/inngest/client"

import { getWorkflow } from "../data"
import { emitStepUpdate } from "./utils"
import { nodeExecutors } from "../nodes/node-executors"
import { resolveNodeInputs, type NodeOutputs } from "../lib/resolve-placeholders"

const executeWorkflowEvent = eventType("app/execute.workflow", {
  schema: z.object({
    id: z.string(),
    orgId: z.string(),
  }),
})

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 3,
    triggers: [executeWorkflowEvent],
    cancelOn: [
      {
        event: "app/cancel.workflow",
        if: "event.data.id == async.data.id",
      },
    ],
  },
  async ({ event, step }) => {
    const { id: workflowId, orgId } = event.data

    // Fetch the workflow from database
    const workflow = await step.run("fetch-workflow", async () => {
      return await getWorkflow(workflowId, orgId)
    })

    if (!workflow) {
      throw new NonRetriableError(`Workflow ${workflowId} not found`)
    }

    // Validate graph exists
    if (!workflow.graph) {
      throw new NonRetriableError(
        `Workflow ${workflowId} has no graph configured`
      )
    }

    const { nodes, edges } = workflow.graph

    // Build set of connected node IDs (nodes that have at least one edge)
    const connectedNodeIds = new Set<string>()
    for (const edge of edges) {
      connectedNodeIds.add(edge.source)
      connectedNodeIds.add(edge.target)
    }

    // Filter to only connected nodes
    const connectedNodes = nodes.filter((node) => connectedNodeIds.has(node.id))

    // Build edge pairs for toposort
    const edgePairs: [string, string][] = edges.map((edge) => [
      edge.source,
      edge.target,
    ])

    // Get topologically sorted node IDs
    const sortedNodeIds = toposort.array(
      connectedNodes.map((n) => n.id),
      edgePairs
    )

    // Create a map for quick node lookup
    const nodeMap = new Map(connectedNodes.map((node) => [node.id, node]))

    let stagehand: Stagehand | undefined

    async function getStagehand() {
      if (stagehand) return stagehand

      stagehand = new Stagehand({
        env: "BROWSERBASE",
        apiKey: process.env.BROWSERBASE_API_KEY,
        model: "google/gemini-2.5-flash",
        disablePino: true,
      })

      await stagehand.init()
      return stagehand
    }

    // Accumulated outputs from executed nodes, keyed by nodeId
    const outputs: NodeOutputs = {}

    // Track execution results for final summary
    const executionResults: {
      nodeId: string
      status: "complete" | "failed"
      error?: string
    }[] = []

    // Loop through nodes in topological order and execute each as a step
    for (const nodeId of sortedNodeIds) {
      const node = nodeMap.get(nodeId)

      if (!node) {
        continue
      }

      // Emit running status before execution starts
      await emitStepUpdate(step, workflowId, nodeId, "running", {
        nodeId: node.id,
        type: node.data.type,
        kind: node.data.kind,
        title: node.data.title,
        startedAt: Date.now(),
      })

      try {
        // Execute node as a durable step - if workflow crashes and retries,
        // completed nodes won't re-execute (memoization)
        const result = await step.run(
          `node-${nodeId}-${node.data.title}`,
          async () => {
            // Resolve placeholders in node values using previous outputs
            const resolvedValues = resolveNodeInputs(node.data.values, outputs)

            const executor = nodeExecutors[node.data.type]

            let executorResult: unknown = null
            if (executor) {
              executorResult = await executor({
                values: resolvedValues,
                getStagehand,
              })
            }

            return {
              nodeId: node.id,
              type: node.data.type,
              kind: node.data.kind,
              title: node.data.title,
              values: resolvedValues,
              output: executorResult,
              executedAt: Date.now(),
            }
          }
        )

        // Store the output for subsequent nodes to reference
        outputs[nodeId] = result.output

        // Emit complete status after successful execution
        await emitStepUpdate(step, workflowId, nodeId, "complete", result)

        executionResults.push({ nodeId, status: "complete" })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        const errorStack = error instanceof Error ? error.stack : undefined

        // Emit failed status with error details
        await emitStepUpdate(step, workflowId, nodeId, "failed", {
          nodeId: node.id,
          type: node.data.type,
          kind: node.data.kind,
          title: node.data.title,
          error: errorMessage,
          errorStack,
          failedAt: Date.now(),
        })

        executionResults.push({ nodeId, status: "failed", error: errorMessage })

        // Clean up stagehand before re-throwing
        await stagehand?.close()

        // Re-throw to let Inngest handle retries
        throw error
      }
    }

    await stagehand?.close()

    return {
      message: `Workflow ${workflowId} complete`,
      nodesExecuted: sortedNodeIds.length,
      executionOrder: sortedNodeIds,
      results: executionResults,
    }
  }
)
