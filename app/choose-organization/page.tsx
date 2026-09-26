import { TaskChooseOrganization } from "@clerk/nextjs"

function ChooseOrganizationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <TaskChooseOrganization redirectUrlComplete="/workflows" />
    </div>
  )
}

export default ChooseOrganizationPage
