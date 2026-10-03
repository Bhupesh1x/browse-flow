import { channel } from "inngest/realtime"
import { z } from "zod"

export const workflowChannel = channel({
  name: (workflowRunId: string) => `workflow:${workflowRunId}`,
  topics: {
    step: {
      schema: z.object({
        name: z.string(),
        status: z.enum(["running", "complete", "failed"]),
        output: z.record(z.string(), z.unknown()).optional(),
        ts: z.number(),
      }),
    },
  },
})
