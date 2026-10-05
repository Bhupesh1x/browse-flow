import { Label } from "@/components/ui/label"

import {
  nodeRegistry,
  type NodeDefinition,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"

import { FieldInput } from "./FieldInput"
import { NodeIcon } from "./NodeIcon"
import { Section } from "./Section"

export function Inspector({ node }: { node: StepNodeType | undefined }) {
  if (!node) {
    return (
      <Section title="Editor">
        <p className="p-3 text-sm text-muted-foreground">No node selected</p>
      </Section>
    )
  }

  const { type, title, values } = node.data
  const def: NodeDefinition = nodeRegistry[type]

  return (
    <Section title={title} icon={<NodeIcon type={type} />}>
      <div className="flex flex-col gap-3 p-3">
        {def.fields.length === 0 ? (
          <p className="text-xs text-muted-foreground">No properties</p>
        ) : (
          def.fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={field.key} className="text-xs">
                {field.label}
              </Label>
              <FieldInput
                field={field}
                value={values[field.key] ?? ""}
                onChange={(value) => {
                  console.log(value)
                }}
              />
            </div>
          ))
        )}
      </div>
    </Section>
  )
}
