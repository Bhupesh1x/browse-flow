"use client"

import { useEffect, useState } from "react"
import { useRealtime } from "inngest/react"

import { workflowChannel } from "../inngest/channels"
import { getWorkflowSubscriptionToken } from "../actions/getWorkflowSubscriptionToken"
import {
  getWorkflowExecutionStatus,
} from "../actions/getWorkflowExecutionStatus"

export type NodeStatus = "running" | "complete" | "failed"

export type NodeExecutionState = {
  nodeId: string
  status: NodeStatus
  output?: Record<string, unknown>
  ts: number
}

/**
 * Subscribe to realtime execution status updates for a workflow.
 * Loads persisted status from DB on mount, then overlays live realtime updates.
 */
export function useWorkflowExecution(workflowId: string | null) {
  // Persisted state from database (survives page refresh)
  const [persistedStatuses, setPersistedStatuses] = useState<
    Map<string, NodeExecutionState>
  >(new Map())
  const [isLoadingPersisted, setIsLoadingPersisted] = useState(true)

  // Fetch persisted status on mount
  useEffect(() => {
    if (!workflowId) {
      setIsLoadingPersisted(false)
      return
    }

    let cancelled = false

    async function fetchPersistedStatus() {
      try {
        const records = await getWorkflowExecutionStatus(workflowId!)
        if (cancelled) return

        const statusMap = new Map<string, NodeExecutionState>()
        for (const record of records) {
          statusMap.set(record.nodeId, {
            nodeId: record.nodeId,
            status: record.status,
            output: record.output,
            ts: record.updatedAt.getTime(),
          })
        }
        setPersistedStatuses(statusMap)
      } catch (error) {
        console.error("Failed to fetch persisted workflow status:", error)
      } finally {
        if (!cancelled) {
          setIsLoadingPersisted(false)
        }
      }
    }

    fetchPersistedStatus()

    return () => {
      cancelled = true
    }
  }, [workflowId])

  // Realtime updates (live stream)
  const { messages, connectionStatus, error } = useRealtime({
    channel: workflowChannel(workflowId ?? ""),
    topics: ["step"] as const,
    token: () => getWorkflowSubscriptionToken(workflowId ?? ""),
    enabled: !!workflowId,
  })

  // Build a map of nodeId -> latest status from realtime messages
  const realtimeStatuses = new Map<string, NodeExecutionState>()

  for (const message of messages.all) {
    const data = message.data as {
      name: string
      status: NodeStatus
      output?: Record<string, unknown>
      ts: number
    }

    realtimeStatuses.set(data.name, {
      nodeId: data.name,
      status: data.status,
      output: data.output,
      ts: data.ts,
    })
  }

  // Merge: persisted status as base, realtime updates overlay
  // Realtime takes precedence (more recent)
  const nodeStatuses = new Map<string, NodeExecutionState>(persistedStatuses)
  for (const [nodeId, state] of realtimeStatuses) {
    nodeStatuses.set(nodeId, state)
  }

  return {
    nodeStatuses,
    connectionStatus,
    error,
    isConnected: connectionStatus === "open",
    isLoadingPersisted,
  }
}
