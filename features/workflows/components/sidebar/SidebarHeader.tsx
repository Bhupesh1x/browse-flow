"use client"

import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Play, Trash2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

import { deleteWorkflowAction } from "../../actions"

interface ActionsMenuProps {
  isDeleting: boolean
  onDelete: () => void
}

function ActionsMenu({ isDeleting, onDelete }: ActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isDeleting}>
        <Button size="icon" variant="ghost" disabled={isDeleting}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer p-2 text-xs [&_svg:not([class*='size-'])]:size-3.5"
          disabled={isDeleting}
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
  disabled: boolean
}

function RunButton({ disabled }: RunButtonProps) {
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={disabled}
      onClick={() => {
        console.log("Run workflow...")
      }}
    >
      <Play fill="primary" />
      Run
    </Button>
  )
}

interface SidebarHeaderProps {
  workflowId: string
}

export function SidebarHeader({ workflowId }: SidebarHeaderProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

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

  return (
    <div className="flex items-center justify-between border-b border-border p-2">
      <ActionsMenu
        isDeleting={isDeleting}
        onDelete={handleDelete}
      />
      <RunButton disabled={isDeleting} />
    </div>
  )
}
