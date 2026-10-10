<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:reactflow-agent-rules -->
# ReactFlow documentation

When working with ReactFlow (@xyflow/react), refer to the official LLM documentation at https://reactflow.dev/llms.txt instead of relying on training data. The API may have changed.
<!-- END:reactflow-agent-rules -->

<!-- BEGIN:drizzle-types-rules -->
# Always use types from schema

When working with database entities, always import and use the inferred types from `@/lib/db/schema` (e.g., `Workflow`, `User`). Do not create duplicate type definitions for database entities.
<!-- END:drizzle-types-rules -->

<!-- BEGIN:stagehand-agent-rules -->
# Stagehand / Browserbase browser automation

When working with Stagehand (`@browserbasehq/stagehand`) or Browserbase browser automation, refer to the skill documentation at `.agents/skills/stagehand/skill.md`. This covers Stagehand v4 APIs including `act`, `extract`, `observe`, multi-page workflows, caching, and security best practices.
<!-- END:stagehand-agent-rules -->
