import { MoreHorizontal, Play, Trash2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

function ActionsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer p-2 text-xs [&_svg:not([class*='size-'])]:size-3.5"
          onSelect={() => {}}
        >
          <Trash2 />
          Delete workflow
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function RunButton() {
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => {
        console.log("Run workflow...")
      }}
    >
      <Play fill="primary" />
      Run
    </Button>
  )
}

export function SidebarHeader() {
  return (
    <div className="flex items-center justify-between border-b border-border p-2">
      <ActionsMenu />
      <RunButton />
    </div>
  )
}
