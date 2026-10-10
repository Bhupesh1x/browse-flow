import { z } from "zod"
import * as toposort from "toposort"
import { eventType, NonRetriableError } from "inngest"

import { inngest } from "@/inngest/client"

import { getWorkflow } from "../data"
import { emitStepUpdate } from "./utils"
import { Stagehand } from "@browserbasehq/stagehand"
import { nodeExecutors } from "../nodes/node-executors"

const executeWorkflowEvent = eventType("app/execute.workflow", {
  schema: z.object({
    id: z.string(),
    orgId: z.string(),
  }),
})

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
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

    // Loop through nodes in topological order and execute each as a step
    for (const nodeId of sortedNodeIds) {
      const node = nodeMap.get(nodeId)

      if (!node) {
        continue
      }

      await emitStepUpdate(step, workflowId, nodeId, "running")

      const executer = nodeExecutors[node.data.type]

      if (executer) {
        await executer({ values: node.data.values, getStagehand })
      }

      const result = await step.run(
        `node-${nodeId}-${node.data.title}`,
        async () => {
          return {
            nodeId: node.id,
            type: node.data.type,
            kind: node.data.kind,
            title: node.data.title,
            values: node.data.values,
            executedAt: Date.now(),
          }
        }
      )

      await emitStepUpdate(step, workflowId, nodeId, "complete", result)
    }

    await stagehand?.close();

    return {
      message: `Workflow ${workflowId} complete`,
      nodesExecuted: sortedNodeIds.length,
      executionOrder: sortedNodeIds,
    }
  }
)
