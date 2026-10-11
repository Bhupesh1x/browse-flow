import { memo } from "react"
import { Loader2 } from "lucide-react"
import { Handle, Position, type NodeProps } from "@xyflow/react"

import { cn } from "@/lib/utils"

import {
  nodeRegistry,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"

import { useNodeExecutionStatus } from "./WorkflowExecutionProvider"

function StepNodeComponent({ id, data, selected }: NodeProps<StepNodeType>) {
  const { type, kind, title, values } = data
  const def = nodeRegistry[type]
  const DefaultIcon = def.icon

  // Get realtime execution status for this node
  const executionStatus = useNodeExecutionStatus(id)
  const isRunning = executionStatus === "running"
  const isFailed = executionStatus === "failed"

  const Icon = isRunning ? Loader2 : DefaultIcon

  // A trigger starts the flow and takes no input, so it has no target handle.
  const hasTarget = kind !== "trigger"

  // Get fields that have values entered
  const fieldsWithValues = def.fields?.filter((field) => values[field.key])

  return (
    <div
      className={cn(
        "max-w-80 min-w-50 rounded-(--radius) border-2 bg-card text-card-foreground transition-all duration-200",
        "border-border",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        // Execution status rings (override selection ring when active)
        isRunning &&
          "border-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-background",
        isFailed &&
          "border-red-500 ring-2 ring-red-500 ring-offset-2 ring-offset-background"
      )}
    >
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ transform: "translate(-100%, -50%)" }}
          className="h-3.5! w-1.5! min-w-0! rounded-l-xs! rounded-r-none! border-0! bg-border!"
        />
      )}

      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md",
            def.accent
          )}
        >
          <Icon className={cn("size-4", isRunning && "animate-spin")} />
        </div>
        <span className="text-sm font-semibold">{title}</span>
      </div>

      {fieldsWithValues?.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-border px-3 py-2.5">
          {fieldsWithValues.map((field) => (
            <div
              key={field.key}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="shrink-0 text-muted-foreground">
                {field.label}
              </span>
              <span className="truncate items-end" title={values[field.key]}>
                {values[field.key]}
              </span>
            </div>
          ))}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{ transform: "translate(100%, -50%)" }}
        className="h-3.5! w-1.5! min-w-0! rounded-l-none! rounded-r-xs! border-0! bg-border!"
      />
    </div>
  )
}

export const StepNode = memo(StepNodeComponent)
