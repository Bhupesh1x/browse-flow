"use client"

import { useCallback, useEffect, useState } from "react"
import { useRealtime } from "inngest/react"

import { workflowChannel } from "../inngest/channels"
import { getWorkflowSubscriptionToken } from "../actions/getWorkflowSubscriptionToken"
import { getWorkflowExecutionStatus } from "../actions/getWorkflowExecutionStatus"

export type NodeStatus = "running" | "complete" | "failed"

export type NodeExecutionState = {
  nodeId: string
  status: NodeStatus
  output?: Record<string, unknown>
  ts: number
}

/**
 * Subscribe to realtime execution status updates for a workflow.
 * 
 * Combines two data sources:
 * 1. Persisted status from DB (survives page refresh)
 * 2. Realtime updates via Inngest (live streaming)
 * 
 * Uses timestamps to resolve conflicts - the most recent status wins.
 * Refetches from DB when tab becomes visible (handles navigate away/back).
 * 
 * Call `resetForNewRun()` before starting a new execution to clear stale statuses.
 */
export function useWorkflowExecution(workflowId: string | null) {
  const [persistedStatuses, setPersistedStatuses] = useState<Map<string, NodeExecutionState>>(new Map())
  const [isLoadingPersisted, setIsLoadingPersisted] = useState(true)
  const [fetchTrigger, setFetchTrigger] = useState(0)
  
  // Track when the current run started - ignore messages/statuses older than this
  const [runStartedAt, setRunStartedAt] = useState<number>(0)

  // Fetch persisted status from database
  const fetchPersistedStatus = useCallback(async (wfId: string) => {
    const records = await getWorkflowExecutionStatus(wfId)
    const statusMap = new Map<string, NodeExecutionState>()
    
    for (const record of records) {
      statusMap.set(record.nodeId, {
        nodeId: record.nodeId,
        status: record.status,
        output: record.output,
        ts: record.updatedAt,
      })
    }
    
    setPersistedStatuses(statusMap)
    return statusMap
  }, [])

  // Fetch on mount and when fetchTrigger changes
  useEffect(() => {
    if (!workflowId) {
      setIsLoadingPersisted(false)
      return
    }

    let cancelled = false

    async function doFetch() {
      try {
        await fetchPersistedStatus(workflowId!)
      } catch (error) {
        console.error("Failed to fetch workflow execution status:", error)
      } finally {
        if (!cancelled) {
          setIsLoadingPersisted(false)
        }
      }
    }

    doFetch()
    return () => { cancelled = true }
  }, [workflowId, fetchTrigger, fetchPersistedStatus])

  // Refetch when tab becomes visible
  useEffect(() => {
    if (!workflowId) return

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        setFetchTrigger((prev) => prev + 1)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [workflowId])

  // Realtime updates
  const { messages, connectionStatus, error } = useRealtime({
    channel: workflowChannel(workflowId ?? ""),
    topics: ["step"] as const,
    token: () => getWorkflowSubscriptionToken(workflowId ?? ""),
    enabled: !!workflowId,
  })

  // Build realtime statuses map (keep only latest per node, ignore pre-run messages)
  const realtimeStatuses = new Map<string, NodeExecutionState>()
  for (const message of messages.all) {
    const data = message.data as {
      name: string
      status: NodeStatus
      output?: Record<string, unknown>
      ts: number
    }

    // Ignore messages from before current run started
    if (runStartedAt > 0 && data.ts < runStartedAt) {
      continue
    }

    const existing = realtimeStatuses.get(data.name)
    if (!existing || data.ts > existing.ts) {
      realtimeStatuses.set(data.name, {
        nodeId: data.name,
        status: data.status,
        output: data.output,
        ts: data.ts,
      })
    }
  }

  // Merge statuses: use whichever has the more recent timestamp
  const nodeStatuses = new Map<string, NodeExecutionState>()

  for (const [nodeId, persistedState] of persistedStatuses) {
    // Ignore persisted statuses from before current run
    if (runStartedAt > 0 && persistedState.ts < runStartedAt) {
      continue
    }
    
    const realtimeState = realtimeStatuses.get(nodeId)
    if (realtimeState && realtimeState.ts > persistedState.ts) {
      nodeStatuses.set(nodeId, realtimeState)
    } else {
      nodeStatuses.set(nodeId, persistedState)
    }
  }

  // Add realtime-only nodes (not yet persisted)
  for (const [nodeId, realtimeState] of realtimeStatuses) {
    if (!nodeStatuses.has(nodeId)) {
      nodeStatuses.set(nodeId, realtimeState)
    }
  }

  // Reset function to call when starting a new run
  const resetForNewRun = useCallback(() => {
    const now = Date.now()
    setRunStartedAt(now)
    setPersistedStatuses(new Map())
  }, [])

  return {
    nodeStatuses,
    connectionStatus,
    error,
    isConnected: connectionStatus === "open",
    isLoadingPersisted,
    resetForNewRun,
  }
}
