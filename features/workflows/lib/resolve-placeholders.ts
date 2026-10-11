export type NodeOutputs = Record<string, unknown>

const PLACEHOLDER_REGEX = /\{\{([^}]+)\}\}/g

/**
 * Resolves all placeholders in a string value.
 * Missing values resolve to empty string. Objects resolve to JSON.
 */
export function resolvePlaceholders(
  value: string,
  outputs: NodeOutputs
): string {
  return value.replace(PLACEHOLDER_REGEX, (_, expression: string) => {
    const parsed = parsePlaceholder(expression)
    if (!parsed) return ""

    const { nodeId, path } = parsed
    const nodeOutput = outputs[nodeId]
    if (nodeOutput === undefined) return ""

    if (!path) return stringify(nodeOutput)

    const resolved = getByPath(nodeOutput, path)
    if (resolved === undefined) return ""

    return stringify(resolved)
  })
}

/**
 * Resolves placeholders in all values of a node's input object.
 */
export function resolveNodeInputs(
  values: Record<string, string>,
  outputs: NodeOutputs
): Record<string, string> {
  const resolved: Record<string, string> = {}
  for (const [key, value] of Object.entries(values)) {
    resolved[key] = resolvePlaceholders(value, outputs)
  }
  return resolved
}

// --- Internal helpers ---

function parsePlaceholder(expr: string): { nodeId: string; path: string } | null {
  const dotIndex = expr.indexOf(".")
  if (dotIndex === -1) {
    return { nodeId: expr.trim(), path: "" }
  }
  const nodeId = expr.slice(0, dotIndex).trim()
  return nodeId ? { nodeId, path: expr.slice(dotIndex + 1).trim() } : null
}

function getByPath(obj: unknown, path: string): unknown {
  const segments = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean)
  let current: unknown = obj

  for (const seg of segments) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[seg]
  }

  return current
}

function stringify(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}
