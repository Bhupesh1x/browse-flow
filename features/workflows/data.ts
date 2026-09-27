import { desc, eq } from "drizzle-orm"

import { db } from "@/lib/db/client"
import { workflows } from "@/lib/db/schema"

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
