"use client"

import { Play } from "lucide-react"
import { useRealtime } from "inngest/react"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"

import { workflowChannel } from "../inngest/channels"
import { executeWorkflowAction } from "../actions/executeWorkflowAction"
import { getWorkflowSubscriptionToken } from "../actions/getWorkflowSubscriptionToken"


interface StepUpdate {
  name: string
  status: "running" | "complete" | "failed"
  output?: Record<string, unknown>
  ts: number
}

export function RightSidebar() {
  const [isPending, startTransition] = useTransition()
  const [workflowRunId, setWorkflowRunId] = useState<string | null>(null)

  const { messages, connectionStatus } = useRealtime({
    channel: workflowChannel(workflowRunId ?? ""),
    topics: ["step"] as const,
    token: () => getWorkflowSubscriptionToken(workflowRunId!),
    enabled: !!workflowRunId,
  })

  function handleRun() {
    startTransition(async () => {
      const result = await executeWorkflowAction()
      setWorkflowRunId(result.workflowRunId)
    })
  }

  return (
    <div className="flex size-full flex-col gap-4 p-4">
      <Button onClick={handleRun} disabled={isPending}>
        <Play />
        {isPending ? "Starting..." : "Run"}
      </Button>

      {workflowRunId && (
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground">
            Status: {connectionStatus}
          </div>

          <ul className="flex flex-col gap-1 text-sm">
            {messages.all.map((message, i) => {
              const data = message.data as StepUpdate
              return (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded border px-2 py-1"
                >
                  <span
                    className={
                      data.status === "complete"
                        ? "text-green-500"
                        : data.status === "failed"
                          ? "text-red-500"
                          : "text-yellow-500"
                    }
                  >
                    {data.status === "complete"
                      ? "✓"
                      : data.status === "failed"
                        ? "✗"
                        : "⋯"}
                  </span>
                  <span>{data.name}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
