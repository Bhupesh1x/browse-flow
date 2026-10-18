import { Edge } from "@xyflow/react"
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

import { StepNodeType } from "@/features/workflows/nodes/node-registry"

export type WorkflowGraph = { nodes: StepNodeType[]; edges: Edge[] }

export const workflows = pgTable("workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: text("org_id").notNull(),
  name: text("name").notNull(),
  graph: jsonb("graph").$type<WorkflowGraph>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type Workflow = typeof workflows.$inferSelect

// Tracks execution status for each node in a workflow run.
// Persists status so UI can show correct state after page refresh.
export type NodeExecutionStatus = "running" | "complete" | "failed"

export const workflowExecutions = pgTable("workflow_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id")
    .notNull()
    .references(() => workflows.id, { onDelete: "cascade" }),
  nodeId: text("node_id").notNull(),
  status: text("status").$type<NodeExecutionStatus>().notNull(),
  output: jsonb("output").$type<Record<string, unknown>>(),
  error: text("error"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type WorkflowExecution = typeof workflowExecutions.$inferSelect
