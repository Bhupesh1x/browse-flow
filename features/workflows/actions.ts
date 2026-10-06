"use server"

import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

import { inngest } from "@/inngest/client"

import type { WorkflowGraph } from "@/lib/db/schema"

import { createWorkflow, deleteWorkflow, saveWorkflowGraph } from "./data"

export async function createWorkflowAction(name: string) {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("No organization selected")
  }

  const workflowId = await createWorkflow(orgId, name)

  revalidatePath("/workflows", "layout")
  redirect(`/workflows/${workflowId}`)
}

export async function deleteWorkflowAction(workflowId: string) {
  const { orgId } = await auth()

  if (!orgId) {
    return { success: false, error: "No organization selected" }
  }

  const deleted = await deleteWorkflow(workflowId, orgId)

  if (!deleted) {
    return { success: false, error: "Workflow not found or already deleted" }
  }

  revalidatePath("/workflows", "layout")
  return { success: true }
}

export async function runWorkflowAction(
  workflowId: string,
  graph: WorkflowGraph
) {
  const { orgId } = await auth()

  if (!orgId) {
    return { success: false, error: "No organization selected." }
  }

  const result = await saveWorkflowGraph(workflowId, orgId, graph)

  if (!result.success) {
    return result
  }

  await inngest.send({
    name: "app/execute.workflow",
    data: { id: workflowId },
  })

  return { success: true }
}

export async function cancelWorkflowAction(workflowId: string) {
  const { orgId } = await auth()

  if (!orgId) {
    return { success: false, error: "No organization selected." }
  }

  await inngest.send({
    name: "app/cancel.workflow",
    data: { id: workflowId },
  })

  return { success: true }
}
