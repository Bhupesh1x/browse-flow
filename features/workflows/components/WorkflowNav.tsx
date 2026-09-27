"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, WorkflowIcon } from "lucide-react"

import { Workflow } from "@/lib/db/schema"
import { generateUniqueName } from "../lib/utils"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

type WorkflowNavProps = {
  workflows: Workflow[]
  createWorkflow: (name: string) => Promise<void>
}

export function WorkflowNav({ workflows, createWorkflow }: WorkflowNavProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const handleCreateWorkflow = () => {
    const name = generateUniqueName()
    createWorkflow(name)
  }

  return (
    <SidebarContent>
      {isCollapsed ? (
        <CollapsedWorkflowMenu
          workflows={workflows}
          onCreateWorkflow={handleCreateWorkflow}
        />
      ) : (
        <ExpandedWorkflowMenu
          workflows={workflows}
          onCreateWorkflow={handleCreateWorkflow}
        />
      )}
    </SidebarContent>
  )
}

function useWorkflowItems(workflows: Workflow[]) {
  const pathname = usePathname()

  return workflows.map((workflow) => ({
    ...workflow,
    href: `/workflows/${workflow.id}`,
    isActive: pathname === `/workflows/${workflow.id}`,
  }))
}

type WorkflowMenuProps = {
  workflows: Workflow[]
  onCreateWorkflow: () => void
}

function CollapsedWorkflowMenu({
  workflows,
  onCreateWorkflow,
}: WorkflowMenuProps) {
  const items = useWorkflowItems(workflows)

  return (
    <SidebarGroup className="p-0">
      <SidebarMenu>
        <SidebarMenuItem className="flex justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <SidebarMenuButton className="size-8 items-center justify-center p-0">
                <WorkflowIcon className="size-4" />
                <span className="sr-only">Workflows</span>
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent side="right" align="start" className="w-64 p-2">
              <div className="flex flex-col">
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start gap-2 px-3 py-2 font-normal"
                  onClick={onCreateWorkflow}
                >
                  <Plus className="size-4" />
                  <span>New workflow</span>
                </Button>
                <div className="mt-1 flex flex-col gap-y-0.5">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
                        item.isActive ? "bg-accent font-medium" : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

function ExpandedWorkflowMenu({
  workflows,
  onCreateWorkflow,
}: WorkflowMenuProps) {
  const items = useWorkflowItems(workflows)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workflows</SidebarGroupLabel>
      <SidebarGroupAction asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-5"
          onClick={onCreateWorkflow}
        >
          <Plus />
          <span className="sr-only">Add Workflow</span>
        </Button>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu className="gap-y-0.5">
          {items.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild isActive={item.isActive}>
                <Link href={item.href}>
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
