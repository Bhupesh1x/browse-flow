import { useMemo } from "react"
import type { LucideIcon } from "lucide-react"
import { useEdges, useNodes, getIncomers } from "@xyflow/react"

import {
  nodeRegistry,
  type StepNodeType,
  type NodeType,
} from "../nodes/node-registry"

export type UpstreamOutput = {
  token: string
  label: string
  icon: LucideIcon
  nodeId: string
  nodeTitle: string
  nodeType: NodeType
  outputLabel: string
}

/**
 * Returns all upstream (ancestor) nodes' outputs for a given node.
 * Traverses the graph backwards from the given nodeId to collect all
 * connected predecessor nodes and their defined outputs.
 */
export function useUpstreamConnections(nodeId: string): UpstreamOutput[] {
  const nodes = useNodes<StepNodeType>()
  const edges = useEdges()

  return useMemo(() => {
    const currentNode = nodes.find((n) => n.id === nodeId)
    if (!currentNode) return []

    // Collect all upstream nodes by traversing backwards
    const upstreamNodes: StepNodeType[] = []
    const visited = new Set<string>()
    const queue: StepNodeType[] = [currentNode]

    while (queue.length > 0) {
      const node = queue.shift()!
      
      // Get immediate predecessors (nodes that have edges pointing to this node)
      const incomers = getIncomers(node, nodes, edges) as StepNodeType[]

      for (const incomer of incomers) {
        if (!visited.has(incomer.id)) {
          visited.add(incomer.id)
          upstreamNodes.push(incomer)
          queue.push(incomer)
        }
      }
    }

    // Build output list from all upstream nodes
    const outputs: UpstreamOutput[] = []

    for (const node of upstreamNodes) {
      const definition = nodeRegistry[node.data.type as NodeType]
      if (!definition) continue

      for (const output of definition.output) {
        outputs.push({
          token: `{{${node.id}.${output.path}}}`,
          label: `${node.data.title} → ${output.label}`,
          icon: definition.icon,
          nodeId: node.id,
          nodeTitle: node.data.title,
          nodeType: node.data.type as NodeType,
          outputLabel: output.label,
        })
      }
    }

    return outputs
  }, [nodeId, nodes, edges])
}
