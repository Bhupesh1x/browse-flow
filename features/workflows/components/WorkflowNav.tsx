"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, WorkflowIcon } from "lucide-react"

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

// Dummy workflows data
const workflows = [
  { id: "1", name: "dominant-wasp" },
  { id: "2", name: "honest-reindeer" },
  { id: "3", name: "expected-llama" },
  { id: "4", name: "essential-ocelot" },
  { id: "5", name: "creepy-echidna" },
  { id: "6", name: "eastern-silkworm" },
  { id: "7", name: "cultural-lion" },
  { id: "8", name: "proud-weasel" },
  { id: "9", name: "regional-bonobo" },
]

export function WorkflowNav() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarContent>
      {isCollapsed ? <CollapsedWorkflowMenu /> : <ExpandedWorkflowMenu />}
    </SidebarContent>
  )
}

function useWorkflowItems() {
  const pathname = usePathname()

  return workflows.map((workflow) => ({
    ...workflow,
    href: `/workflows/${workflow.id}`,
    isActive: pathname === `/workflows/${workflow.id}`,
  }))
}

function CollapsedWorkflowMenu() {
  const items = useWorkflowItems()

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

function ExpandedWorkflowMenu() {
  const items = useWorkflowItems()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workflows</SidebarGroupLabel>
      <SidebarGroupAction asChild>
        <Button variant="ghost" size="icon" className="size-5">
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
