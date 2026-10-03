"use server"

import { getClientSubscriptionToken } from "inngest/react"

import { inngest } from "@/inngest/client"

import { workflowChannel } from "../inngest/channels"

export async function getWorkflowSubscriptionToken(workflowRunId: string) {
  return getClientSubscriptionToken(inngest, {
    channel: workflowChannel(workflowRunId),
    topics: ["step"],
  })
}
