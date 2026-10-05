import { Room } from "@/features/workflows/components/Room"
import { WorkflowShell } from "@/features/workflows/components/WorkflowShell"

export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ workflowId: string }>
}) {
  const { workflowId } = await params

  return (
    <div className="h-full w-full">
      <Room roomId={workflowId}>
      <WorkflowShell workflowId={workflowId} />
      </Room>
    </div>
  )
}
