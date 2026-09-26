import { Plus, Workflow } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

function WorkflowsPage() {
  return (
    <div className="flex min-h-screen flex-col gap-y-4 bg-background p-2">
      <Empty className="flex-1 border-0">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-xl [&_svg]:size-6"
          >
            <Workflow className="size-10" />
          </EmptyMedia>
          <EmptyTitle className="text-xl">No workflow selected</EmptyTitle>
          <EmptyDescription className="text-base">
            Select a workflow from the sidebar or create a new one to get
            started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="lg">
            <Plus data-icon="inline-start" />
            New workflow
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

export default WorkflowsPage
