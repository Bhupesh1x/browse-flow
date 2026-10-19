"use server"

import { eq } from "drizzle-orm"

import { db } from "@/lib/db/client"
import { workflowExecutions } from "@/lib/db/schema"

export type NodeExecutionRecord = {
  nodeId: string
  status: "running" | "complete" | "failed"
  output?: Record<string, unknown>
  error?: string | null
  /** Unix timestamp in milliseconds */
  updatedAt: number
}

/**
 * Fetch persisted execution status for all nodes in a workflow.
 * Used to restore UI state after page refresh.
 */
export async function getWorkflowExecutionStatus(
  workflowId: string
): Promise<NodeExecutionRecord[]> {
  const executions = await db
    .select({
      nodeId: workflowExecutions.nodeId,
      status: workflowExecutions.status,
      output: workflowExecutions.output,
      error: workflowExecutions.error,
      updatedAt: workflowExecutions.updatedAt,
    })
    .from(workflowExecutions)
    .where(eq(workflowExecutions.workflowId, workflowId))

  // Convert Date to timestamp for safe serialization across server/client boundary
  return executions.map((exec) => ({
    nodeId: exec.nodeId,
    status: exec.status as NodeExecutionRecord["status"],
    output: exec.output ?? undefined,
    error: exec.error,
    updatedAt: exec.updatedAt.getTime(),
  }))
}

/**
 * Clear execution status for a workflow (called before starting a new run).
 */
export async function clearWorkflowExecutionStatus(
  workflowId: string
): Promise<void> {
  await db
    .delete(workflowExecutions)
    .where(eq(workflowExecutions.workflowId, workflowId))
}
