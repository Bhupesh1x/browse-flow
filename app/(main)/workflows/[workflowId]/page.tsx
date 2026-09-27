export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ workflowId: string }>
}) {
  const { workflowId } = await params

  return (
    <div className="flex min-h-screen flex-col gap-y-4 bg-background p-2">
      <h1 className="text-2xl font-bold">Workflow: {workflowId}</h1>
    </div>
  )
}
