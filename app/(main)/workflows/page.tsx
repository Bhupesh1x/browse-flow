import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"

function WorkflowsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col gap-y-4 p-2">
      <OrganizationSwitcher
        hidePersonal
        afterCreateOrganizationUrl="/workflows"
        afterSelectOrganizationUrl="/workflows"
        afterLeaveOrganizationUrl="/choose-organization"
      />
      <UserButton />
    </div>
  )
}

export default WorkflowsPage
