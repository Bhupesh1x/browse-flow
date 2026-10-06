"use client"

import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useReactFlow } from "@xyflow/react"
import { MoreHorizontal, Play, Trash2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

import { validateGraph } from "../../lib/validate-graph"
import type { StepNodeType } from "../../nodes/node-registry"
import { deleteWorkflowAction, runWorkflowAction } from "../../actions"


interface ActionsMenuProps {
  disabled: boolean
  isDeleting: boolean
  onDelete: () => void
}

function ActionsMenu({ disabled, isDeleting, onDelete }: ActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button size="icon" variant="ghost" disabled={disabled}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer p-2 text-xs [&_svg:not([class*='size-'])]:size-3.5"
          disabled={disabled}
          onSelect={(e) => {
            e.preventDefault()
            onDelete()
          }}
        >
          <Trash2 />
          {isDeleting ? "Deleting..." : "Delete workflow"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface RunButtonProps {
  isRunningWorkflow: boolean
  disabled: boolean
  onRun: () => void
}

function RunButton({ isRunningWorkflow, disabled, onRun }: RunButtonProps) {
  return (
    <Button size="sm" variant="secondary" disabled={disabled} onClick={onRun}>
      <Play fill="primary" />
      {isRunningWorkflow ? "Running..." : "Run"}
    </Button>
  )
}

interface SidebarHeaderProps {
  workflowId: string
}

export function SidebarHeader({ workflowId }: SidebarHeaderProps) {
  const router = useRouter()
  const { getNodes, getEdges } = useReactFlow<StepNodeType>()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)

    const result = await deleteWorkflowAction(workflowId)

    if (result.success) {
      toast.success("Workflow deleted successfully")
      router.push("/workflows")
    } else {
      toast.error(result.error ?? "Failed to delete workflow")
      setIsDeleting(false)
    }
  }

  async function handleRun() {
    const graph = {
      nodes: getNodes(),
      edges: getEdges(),
    }

    const errors = validateGraph(graph)

    if (errors.length > 0) {
      toast.error(errors.join(","))
      return
    }

    setIsRunning(true)

    const result = await runWorkflowAction(workflowId, graph)

    if (result.success) {
      toast.success("Workflow started...")
    } else {
      toast.error(result.error)
    }

    setIsRunning(false)
  }

  const isDisabled = isDeleting || isRunning

  return (
    <div className="flex items-center justify-between border-b border-border p-2">
      <ActionsMenu
        disabled={isDisabled}
        isDeleting={isDeleting}
        onDelete={handleDelete}
      />
      <RunButton
        disabled={isDisabled}
        isRunningWorkflow={isRunning}
        onRun={handleRun}
      />
    </div>
  )
}
