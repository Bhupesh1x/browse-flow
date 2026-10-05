import { and, desc, eq } from "drizzle-orm"

import { db } from "@/lib/db/client"
import { workflows } from "@/lib/db/schema"
import { liveblocks } from "@/lib/liveblocks"

export async function getWorkflow(id: string, orgId: string) {
  const [workflow] = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))

  return workflow ?? null
}

export async function listWorkflow(orgId: string) {
  return await db
    .select()
    .from(workflows)
    .where(eq(workflows.orgId, orgId))
    .orderBy(desc(workflows.createdAt))
}

export async function createWorkflow(orgId: string, name: string) {
  const [workflow] = await db
    .insert(workflows)
    .values({ orgId, name })
    .returning({ id: workflows.id })

  return workflow.id
}

export async function deleteWorkflow(id: string, orgId: string) {
  const [workflow] = await db
    .select({ id: workflows.id })
    .from(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))

  if (!workflow) {
    return false
  }

  await liveblocks.deleteRoom(id)

  await db
    .delete(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))

  return true
}
