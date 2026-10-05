"use client"

import {
  ReactFlow,
  Controls,
  ConnectionLineType,
  type ColorMode,
  Panel,
} from "@xyflow/react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { AvatarStack } from "@liveblocks/react-ui"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"

import { StepNode } from "@/features/workflows/components/StepNode"
import type { StepNodeType } from "@/features/workflows/nodes/node-registry"

import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"

const nodeTypes = { step: StepNode }

const initialNodes: StepNodeType[] = [
  {
    id: "start",
    type: "step",
    position: { x: 0, y: 0 },
    data: { type: "start", kind: "trigger", title: "Start", values: {} },
  },
]

export function WorkflowCanvas() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<StepNodeType>({
      suspense: true,
      nodes: { initial: initialNodes },
      edges: { initial: [] },
    })

  useEffect(() => {
    setMounted(true)
  }, [])

  const colorMode: ColorMode =
    mounted && resolvedTheme === "dark" ? "dark" : "light"

  return (
    <div className="size-full">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        colorMode={colorMode}
        fitView
        connectionLineStyle={{ stroke: "var(--border)" }}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "var(--border)" },
        }}
        style={
          {
            "--xy-background-color": "var(--background)",
            "--xy-edge-stroke-width": 2,
            "--xy-connectionline-stroke-width": 2,
          } as React.CSSProperties
        }
        maxZoom={1}
      >
        <Cursors />
        <Controls />
        <Panel position="top-right">
          <AvatarStack />
        </Panel>
      </ReactFlow>
    </div>
  )
}
