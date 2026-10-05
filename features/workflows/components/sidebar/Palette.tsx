"use client"

import { toast } from "sonner"
import { useReactFlow, useStore } from "@xyflow/react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

import {
  nodeRegistry,
  type NodeType,
  type StepNodeKind,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"

import { NodeIcon } from "./NodeIcon"
import { Section } from "./Section"

const sections: { kind: StepNodeKind; label: string }[] = [
  { kind: "trigger", label: "Triggers" },
  { kind: "action", label: "Actions" },
]

const definitions = Object.values(nodeRegistry)

export function Palette() {
  const { getNodes, addNodes, getViewport } = useReactFlow<StepNodeType>()
  // The pane's measured size, used to find the center of the current view.
  const width = useStore((store) => store.width)
  const height = useStore((store) => store.height)

  const add = (type: NodeType) => {
    const definition = nodeRegistry[type]
    const nodes = getNodes()

    // Check if trying to add a trigger node when one already exists
    if (definition.kind === "trigger") {
      const existingTrigger = nodes.find((node) => node.data.kind === "trigger")
      if (existingTrigger) {
        toast.error("Only one trigger node is allowed per workflow")
        return
      }
    }

    // Count existing nodes of the same type for label numbering
    const sameTypeNodes = nodes.filter((node) => node.data.type === type)
    const count = sameTypeNodes.length + 1
    const title = count > 1 ? `${definition.label} ${count}` : definition.label

    // Calculate position at center of viewport with random offset
    const { x, y, zoom } = getViewport()
    const position = {
      x: (width / 2 - x) / zoom,
      y: (height / 2 - y) / zoom,
    }

    const newNode: StepNodeType = {
      id: crypto.randomUUID(),
      type: "step",
      position,
      data: {
        type,
        kind: definition.kind,
        title,
        values: {},
      },
    }

    addNodes(newNode)
  }

  return (
    <Section title="Toolbar">
      <Accordion
        type="multiple"
        defaultValue={sections.map((section) => section.kind)}
        className="px-3 py-2"
      >
        {sections.map((section) => (
          <AccordionItem
            key={section.kind}
            value={section.kind}
            className="not-last:border-b-0"
          >
            <AccordionTrigger className="py-2 text-xs font-medium text-muted-foreground hover:no-underline">
              {section.label}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-0.5">
              {definitions
                ?.filter((def) => def.kind === section.kind)
                ?.map((def) => (
                  <Button
                    key={def.type}
                    variant="ghost"
                    onClick={() => add(def.type as NodeType)}
                    className="justify-start gap-2.5 px-1.5 text-xs"
                  >
                    <NodeIcon type={def.type as NodeType} />
                    {def.label}
                  </Button>
                ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  )
}
