"use client"

import { AlertTriangle } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export default function WorkflowsError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col gap-y-4 bg-background p-2">
      <Empty className="flex-1 border-0">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-xl [&_svg]:size-6"
          >
            <AlertTriangle className="size-10" />
          </EmptyMedia>
          <EmptyTitle className="text-xl">Something went wrong</EmptyTitle>
          <EmptyDescription className="text-base">
            An error occurred while loading this page. Please try again.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="lg" onClick={() => retry()}>
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
