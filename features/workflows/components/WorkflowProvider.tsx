"use client"

import { ReactFlowProvider } from "@xyflow/react"
import type { ReactNode } from "react"

export function WorkflowProvider({ children }: { children: ReactNode }) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>
}
