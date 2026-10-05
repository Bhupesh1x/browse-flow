"use client"

import { useState } from "react"

import { type StepNodeType } from "@/features/workflows/nodes/node-registry"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Palette } from "./sidebar/Palette"
import { Inspector } from "./sidebar/Inspector"
import { SidebarHeader } from "./sidebar/SidebarHeader"

export function RightSidebar() {
  const [tab, setTab] = useState("toolbar")
  const selected: StepNodeType | undefined = undefined

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="flex size-full flex-col"
    >
      <SidebarHeader />
      <TabsList
        className="gap-x-2 bg-transparent px-2"
        style={{ display: "flex", gap: 2 }}
      >
        <TabsTrigger
          value="toolbar"
          className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
        >
          Toolbar
        </TabsTrigger>
        <TabsTrigger
          value="editor"
          className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
        >
          Editor
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value="toolbar"
        className="mt-0 flex min-h-0 flex-1 flex-col"
      >
        <Palette />
      </TabsContent>
      <TabsContent value="editor" className="mt-0 flex min-h-0 flex-1 flex-col">
        <Inspector node={selected} />
      </TabsContent>
    </Tabs>
  )
}
