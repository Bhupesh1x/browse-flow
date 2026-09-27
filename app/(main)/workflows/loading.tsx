import { Spinner } from "@/components/ui/spinner"

export default function WorkflowsLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-2">
      <Spinner className="size-8" />
    </div>
  )
}
