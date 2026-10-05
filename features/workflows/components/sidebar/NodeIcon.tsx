import { cn } from "@/lib/utils"

import {
  nodeRegistry,
  type NodeType,
} from "@/features/workflows/nodes/node-registry"

export function NodeIcon({
  type,
  className,
}: {
  type: NodeType
  className?: string
}) {
  const def = nodeRegistry[type]
  const Icon = def.icon
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md",
        def.accent,
        className
      )}
    >
      <Icon className="size-3.5" />
    </span>
  )
}
