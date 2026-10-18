"use server"

import { eq } from "drizzle-orm"

import { db } from "@/lib/db/client"
import { workflowExecutions } from "@/lib/db/schema"

export type NodeExecutionRecord = {
  nodeId: string
  status: "running" | "complete" | "failed"
  output?: Record<string, unknown>
  error?: string | null
  updatedAt: Date
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

  return executions as NodeExecutionRecord[]
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
