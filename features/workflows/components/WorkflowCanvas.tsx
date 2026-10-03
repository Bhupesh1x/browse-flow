"use client"

import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useCallback, useState } from "react"

const initialNodes: Node[] = [
  {
    id: "n1",
    position: { x: 0, y: 0 },
    data: { label: "Node 1" },
    type: "input",
  },
  {
    id: "n2",
    position: { x: 100, y: 100 },
    data: { label: "Node 2" },
    type: "output",
  },
]

const initialEdges: Edge[] = [
  {
    id: "n1-n2",
    source: "n1",
    target: "n2",
    type: "smoothstep",
  },
]

export function WorkflowCanvas() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  )

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
      </ReactFlow>
    </div>
  )
}
