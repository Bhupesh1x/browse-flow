<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:drizzle-types-rules -->
# Always use types from schema

When working with database entities, always import and use the inferred types from `@/lib/db/schema` (e.g., `Workflow`, `User`). Do not create duplicate type definitions for database entities.
<!-- END:drizzle-types-rules -->
