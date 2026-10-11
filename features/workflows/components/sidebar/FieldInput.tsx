import { forwardRef } from "react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { type NodeField } from "@/features/workflows/nodes/node-registry"

interface FieldInputProps {
  field: NodeField
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
}

export const FieldInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FieldInputProps
>(function FieldInput({ field, value, onChange, onFocus }, ref) {
  if (field.multiline) {
    return (
      <Textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        id={field.key}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        rows={3}
      />
    )
  }

  return (
    <Input
      ref={ref as React.Ref<HTMLInputElement>}
      id={field.key}
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
    />
  )
})
