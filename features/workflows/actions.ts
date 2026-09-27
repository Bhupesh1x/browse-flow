"use server"

import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

import { createWorkflow } from "./data"

export async function createWorkflowAction(name: string) {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("No organization selected")
  }

  const workflowId = await createWorkflow(orgId, name)

  revalidatePath("/workflows", "layout")
  redirect(`/workflows/${workflowId}`)
}
