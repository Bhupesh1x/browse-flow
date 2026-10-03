import type { StepTools } from "inngest"

import { workflowChannel } from "./channels"

export async function emitStepUpdate(
  step: StepTools,
  workflowRunId: string,
  name: string,
  status: "running" | "complete" | "failed",
  output?: Record<string, unknown>
) {
  await step.realtime.publish(
    `emit-${name}-${status}`,
    workflowChannel(workflowRunId).step,
    { name, status, output, ts: Date.now() }
  )
}
