import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"

import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { WorkflowNav } from "@/features/workflows/components/WorkflowNav"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="group-data-[collapsible=icon]:px-0">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <div className="max-w-[calc(100%-3rem)] min-w-0 group-data-[collapsible=icon]:hidden">
            <OrganizationSwitcher
              hidePersonal
              afterSelectOrganizationUrl="/workflows"
              appearance={{
                elements: {
                  rootBox: "w-full max-w-full",
                  organizationSwitcherTrigger:
                    "w-full justify-start px-2 py-1.5 hover:bg-sidebar-accent rounded-md",
                },
              }}
            />
          </div>
          <SidebarTrigger className="shrink-0" />
        </div>
      </SidebarHeader>

      <WorkflowNav />

      <SidebarFooter className="group-data-[collapsible=icon]:px-0">
        <div className="flex group-data-[collapsible=icon]:justify-center">
          <UserButton showName={false} />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
