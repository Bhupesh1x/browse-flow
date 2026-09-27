import { WorkflowShell } from "@/features/workflows/components/WorkflowShell"

export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ workflowId: string }>
}) {
  const { workflowId } = await params

  return (
    <div className="h-full w-full">
      <WorkflowShell workflowId={workflowId} />
    </div>
  )
}
