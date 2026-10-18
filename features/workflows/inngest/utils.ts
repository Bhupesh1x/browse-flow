import { and, eq } from "drizzle-orm"
import type { GetStepTools } from "inngest"

import { db } from "@/lib/db/client"
import { workflowExecutions, type NodeExecutionStatus } from "@/lib/db/schema"
import { inngest } from "@/inngest/client"

import { workflowChannel } from "./channels"

type StepTools = GetStepTools<typeof inngest>

export async function emitStepUpdate(
  step: StepTools,
  workflowId: string,
  nodeId: string,
  status: NodeExecutionStatus,
  output?: Record<string, unknown>
) {
  // Persist to database for state recovery on page refresh
  await step.run(`persist-${nodeId}-${status}`, async () => {
    await upsertNodeExecution(workflowId, nodeId, status, output)
  })

  // Publish realtime event for live UI updates
  await step.realtime.publish(
    `emit-${nodeId}-${status}`,
    workflowChannel(workflowId).step,
    { name: nodeId, status, output, ts: Date.now() }
  )
}

/**
 * Upsert node execution status in database.
 * Creates a new record or updates existing one for the same workflow+node.
 */
async function upsertNodeExecution(
  workflowId: string,
  nodeId: string,
  status: NodeExecutionStatus,
  output?: Record<string, unknown>
) {
  const error = output?.error as string | undefined

  // Check if record exists
  const [existing] = await db
    .select({ id: workflowExecutions.id })
    .from(workflowExecutions)
    .where(
      and(
        eq(workflowExecutions.workflowId, workflowId),
        eq(workflowExecutions.nodeId, nodeId)
      )
    )

  if (existing) {
    await db
      .update(workflowExecutions)
      .set({
        status,
        output,
        error,
        updatedAt: new Date(),
      })
      .where(eq(workflowExecutions.id, existing.id))
  } else {
    await db.insert(workflowExecutions).values({
      workflowId,
      nodeId,
      status,
      output,
      error,
    })
  }
}
