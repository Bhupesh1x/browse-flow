"use server"

import { inngest } from "@/inngest/client"

export async function executeWorkflowAction() {
  // Generate a unique run ID for this workflow execution
  const workflowRunId = crypto.randomUUID()

  await inngest.send({
    name: "app/execute.workflow",
    data: { id: workflowRunId },
  })

  return { message: "Event sent", workflowRunId }
}
