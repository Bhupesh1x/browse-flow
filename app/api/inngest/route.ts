import { serve } from "inngest/next"

import { inngest } from "@/inngest/client"
import { executeWorkflow } from "@/features/workflows/inngest/execute-workflow"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [executeWorkflow],
})
