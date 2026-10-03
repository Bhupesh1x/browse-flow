import { z } from "zod"
import { eventType } from "inngest"

import { inngest } from "@/inngest/client"

import { emitStepUpdate } from "./utils"

const executeWorkflowEvent = eventType("app/execute.workflow", {
  schema: z.object({
    id: z.string(),
  }),
})

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow", triggers: [executeWorkflowEvent] },
  async ({ event, step }) => {
    const workflowRunId = event.data.id

    await emitStepUpdate(step, workflowRunId, "handle-task", "running")

    const result = await step.run("handle-task", async () => {
      return { processed: true, id: workflowRunId }
    })

    await emitStepUpdate(step, workflowRunId, "handle-task", "complete", result)

    await emitStepUpdate(step, workflowRunId, "pause", "running")

    await step.sleep("pause", "5s")

    await emitStepUpdate(step, workflowRunId, "pause", "complete")

    await emitStepUpdate(step, workflowRunId, "workflow", "complete", {
      message: `Task ${workflowRunId} complete`,
    })

    return { message: `Task ${workflowRunId} complete`, result }
  }
)