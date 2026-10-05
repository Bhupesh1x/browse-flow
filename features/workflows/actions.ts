"use server"

import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

import { createWorkflow, deleteWorkflow } from "./data"

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
