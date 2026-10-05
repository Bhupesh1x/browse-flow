import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"

import { liveblocks } from "@/lib/liveblocks"

import { getWorkflow } from "@/features/workflows/data"
import { Room } from "@/features/workflows/components/Room"
import { WorkflowShell } from "@/features/workflows/components/WorkflowShell"

export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ workflowId: string }>
}) {
  const { workflowId } = await params

  const { orgId } = await auth()
  if (!orgId) return notFound()

  const workflow = await getWorkflow(workflowId, orgId)
  if (!workflow) return notFound()

  await liveblocks.getOrCreateRoom(workflowId, {
    defaultAccesses: [],
    groupsAccesses: {
      [orgId]: ["room:write"],
    },
    organizationId: orgId
  })

  return (
    <div className="h-full w-full">
      <Room roomId={workflowId}>
        <WorkflowShell workflowId={workflowId} />
      </Room>
    </div>
  )
}
