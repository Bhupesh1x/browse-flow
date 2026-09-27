import Link from "next/link"
import { Search } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export default function WorkflowNotFound() {
  return (
    <div className="flex min-h-screen flex-col gap-y-4 bg-background p-2">
      <Empty className="flex-1 border-0">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-xl [&_svg]:size-6"
          >
            <Search className="size-10" />
          </EmptyMedia>
          <EmptyTitle className="text-xl">Workflow not found</EmptyTitle>
          <EmptyDescription className="text-base">
            The workflow you're looking for doesn't exist or has been deleted.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="lg" asChild>
            <Link href="/workflows">Back to workflows</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
