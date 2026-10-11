"use client"

import {
  createContext,
  useContext,
  type ReactNode,
} from "react"

import {
  useWorkflowExecution,
  type NodeExecutionState,
  type NodeStatus,
} from "../hooks/useWorkflowExecution"

type WorkflowExecutionContextValue = {
  nodeStatuses: Map<string, NodeExecutionState>
  getNodeStatus: (nodeId: string) => NodeStatus | null
  isConnected: boolean
}

const WorkflowExecutionContext =
  createContext<WorkflowExecutionContextValue | null>(null)

type WorkflowExecutionProviderProps = {
  workflowId: string | null
  children: ReactNode
}

export function WorkflowExecutionProvider({
  workflowId,
  children,
}: WorkflowExecutionProviderProps) {
  const { nodeStatuses, isConnected } = useWorkflowExecution(workflowId)

  const getNodeStatus = (nodeId: string): NodeStatus | null => {
    return nodeStatuses.get(nodeId)?.status ?? null
  }

  return (
    <WorkflowExecutionContext.Provider
      value={{ nodeStatuses, getNodeStatus, isConnected }}
    >
      {children}
    </WorkflowExecutionContext.Provider>
  )
}

export function useWorkflowExecutionContext() {
  const context = useContext(WorkflowExecutionContext)
  if (!context) {
    throw new Error(
      "useWorkflowExecutionContext must be used within WorkflowExecutionProvider"
    )
  }
  return context
}

/**
 * Get the execution status for a specific node.
 * Returns null if not within the provider or no status available.
 */
export function useNodeExecutionStatus(nodeId: string): NodeStatus | null {
  const context = useContext(WorkflowExecutionContext)
  return context?.getNodeStatus(nodeId) ?? null
}
