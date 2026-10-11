"use client"

import { useRealtime } from "inngest/react"

import { workflowChannel } from "../inngest/channels"
import { getWorkflowSubscriptionToken } from "../actions/getWorkflowSubscriptionToken"

export type NodeStatus = "running" | "complete" | "failed"

export type NodeExecutionState = {
  nodeId: string
  status: NodeStatus
  output?: Record<string, unknown>
  ts: number
}

/**
 * Subscribe to realtime execution status updates for a workflow.
 * Returns a map of nodeId -> current status for rendering in the canvas.
 */
export function useWorkflowExecution(workflowId: string | null) {
  const { messages, connectionStatus, error } = useRealtime({
    channel: workflowChannel(workflowId ?? ""),
    topics: ["step"] as const,
    token: () => getWorkflowSubscriptionToken(workflowId ?? ""),
    enabled: !!workflowId,
  })

  // Build a map of nodeId -> latest status from the message stream
  const nodeStatuses = new Map<string, NodeExecutionState>()

  for (const message of messages.all) {
    const data = message.data as {
      name: string
      status: NodeStatus
      output?: Record<string, unknown>
      ts: number
    }

    nodeStatuses.set(data.name, {
      nodeId: data.name,
      status: data.status,
      output: data.output,
      ts: data.ts,
    })
  }

  return {
    nodeStatuses,
    connectionStatus,
    error,
    isConnected: connectionStatus === "open",
  }
}
