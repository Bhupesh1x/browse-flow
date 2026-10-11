import { useReactFlow } from "@xyflow/react"
import { useRef, useState, useEffect, createRef } from "react"

import { Label } from "@/components/ui/label"

import {
  nodeRegistry,
  type NodeDefinition,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"
import { useUpstreamConnections } from "@/features/workflows/hooks/useUpstreamConnections"

import { Section } from "./Section"
import { NodeIcon } from "./NodeIcon"
import { FieldInput } from "./FieldInput"

export function Inspector({ node }: { node: StepNodeType | undefined }) {
  const { updateNodeData } = useReactFlow()
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null)
  
  // Get upstream connections for the selected node
  const upstreamOutputs = useUpstreamConnections(node?.id ?? "")

  // Create refs for each field input
  const fieldRefs = useRef<Map<string, React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>>>(new Map())

  // Reset active field when node changes
  useEffect(() => {
    setActiveFieldKey(null)
  }, [node?.id])

  if (!node) {
    return (
      <Section title="Editor">
        <p className="p-3 text-sm text-muted-foreground">No node selected</p>
      </Section>
    )
  }

  const { type, title, values } = node.data
  const def: NodeDefinition = nodeRegistry[type]

  // Ensure refs exist for all fields
  for (const field of def.fields) {
    if (!fieldRefs.current.has(field.key)) {
      fieldRefs.current.set(field.key, createRef())
    }
  }

  const handleInsertToken = (token: string) => {
    // Determine which field to insert into
    const targetFieldKey = activeFieldKey ?? def.fields[0]?.key
    if (!targetFieldKey) return

    const currentValue = values[targetFieldKey] ?? ""
    const inputRef = fieldRefs.current.get(targetFieldKey)?.current

    let newValue: string
    if (inputRef && "selectionStart" in inputRef && inputRef.selectionStart !== null) {
      // Insert at cursor position
      const start = inputRef.selectionStart
      const end = inputRef.selectionEnd ?? start
      newValue = currentValue.slice(0, start) + token + currentValue.slice(end)
    } else {
      // Append to end
      newValue = currentValue + token
    }

    updateNodeData(node.id, {
      values: { ...values, [targetFieldKey]: newValue },
    })

    // Focus the field after insertion
    inputRef?.focus()
  }

  return (
    <div className="flex flex-col">
      <Section title={title} icon={<NodeIcon type={type} />}>
        <div className="flex flex-col gap-3 p-3">
          {def.fields.length === 0 ? (
            <p className="text-xs text-muted-foreground">No properties</p>
          ) : (
            def.fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label htmlFor={field.key} className="text-xs">
                  {field.label}
                  {field.required && <span className="text-destructive"> *</span>}
                </Label>
                <FieldInput
                  ref={fieldRefs.current.get(field.key)}
                  field={field}
                  value={values[field.key] ?? ""}
                  onChange={(value) => {
                    updateNodeData(node.id, {
                      values: { ...values, [field.key]: value },
                    })
                  }}
                  onFocus={() => setActiveFieldKey(field.key)}
                />
              </div>
            ))
          )}
        </div>
      </Section>

      {upstreamOutputs.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-dashed border-border p-3">
          <span className="text-xs">Connections</span>
          <div className="flex flex-wrap gap-2">
            {upstreamOutputs.map((output) => (
              <button
                key={output.token}
                type="button"
                onClick={() => handleInsertToken(output.token)}
                className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 text-xs transition-colors hover:bg-accent"
              >
                <NodeIcon type={output.nodeType} className="size-5" />
                <span>{output.nodeTitle} · {output.outputLabel}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
