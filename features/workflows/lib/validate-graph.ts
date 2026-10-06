import * as toposort from "toposort"

import type { WorkflowGraph } from "@/lib/db/schema"

export function validateGraph(graph: WorkflowGraph): string[] {
  const errors: string[] = []
  const { nodes, edges } = graph

  // 1. Validate trigger nodes
  const triggerNodes = nodes.filter((node) => node.data.kind === "trigger")

  if (triggerNodes.length === 0) {
    errors.push("Workflow must have a trigger node to start execution.")
  } else if (triggerNodes.length > 1) {
    errors.push(
      `Workflow must have exactly one trigger node, but found ${triggerNodes.length}.`
    )
  }

  // 2. Validate at least one edge exists
  if (edges.length === 0) {
    errors.push("Workflow must have at least one connection between nodes.")
  }

  // 3. Validate no cycles using toposort
  const edgePairs: [string, string][] = edges.map((edge) => [
    edge.source,
    edge.target,
  ])
  const nodeIds = nodes.map((node) => node.id)

  try {
    toposort.array(nodeIds, edgePairs)
  } catch (error) {
    const cycleMessage =
      error instanceof Error ? error.message : "Unknown cycle detected"
    errors.push(`Workflow contains a cycle. ${cycleMessage}`)
  }

  return errors
}
