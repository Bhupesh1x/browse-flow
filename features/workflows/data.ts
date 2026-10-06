import { and, desc, eq } from "drizzle-orm"

import { db } from "@/lib/db/client"
import { liveblocks } from "@/lib/liveblocks"
import { workflows, type WorkflowGraph } from "@/lib/db/schema"

import { validateGraph } from "./lib/validate-graph"

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

export async function saveWorkflowGraph(
  id: string,
  orgId: string,
  graph: WorkflowGraph
): Promise<{ success: true } | { success: false; error: string }> {
  const errors = validateGraph(graph)

  if (errors.length > 0) {
    return { success: false, error: errors.join(",") }
  }

  const [workflow] = await db
    .update(workflows)
    .set({ graph, updatedAt: new Date() })
    .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))
    .returning({ id: workflows.id })

  if (!workflow) {
    return { success: false, error: "Workflow not found." }
  }

  return { success: true }
}
