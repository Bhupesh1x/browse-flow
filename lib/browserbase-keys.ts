export interface BrowserbaseKey {
  name: string
  apiKey: string
}

interface KeyState {
  key: BrowserbaseKey
  isExhausted: boolean
  exhaustedAt?: Date
  usageCount: number
}

// In-memory state for key rotation (resets on deploy, which aligns with monthly quota resets)
const keyStates: Map<string, KeyState> = new Map()
let initialized = false

function loadKeys(): BrowserbaseKey[] {
  const keys: BrowserbaseKey[] = []

  // Load numbered keys: BROWSERBASE_KEY_1, BROWSERBASE_KEY_2, etc.
  for (let i = 1; i <= 20; i++) {
    const apiKey = process.env[`BROWSERBASE_KEY_${i}`]

    if (apiKey) {
      keys.push({
        name: `Account ${i}`,
        apiKey,
      })
    } else {
      // Stop at first missing key (no gaps allowed)
      break
    }
  }

  // If no numbered keys found, fall back to single key
  if (keys.length === 0) {
    const apiKey = process.env.BROWSERBASE_API_KEY

    if (apiKey) {
      keys.push({
        name: "Default",
        apiKey,
      })
    }
  }

  return keys
}

function initializeIfNeeded() {
  if (initialized) return

  const keys = loadKeys()
  for (const key of keys) {
    keyStates.set(key.apiKey, {
      key,
      isExhausted: false,
      usageCount: 0,
    })
  }

  initialized = true
  console.log(`[browserbase-keys] Initialized with ${keys.length} key(s)`)
}

/**
 * Get the next available (non-exhausted) Browserbase key.
 * Returns null if all keys are exhausted.
 */
export function getAvailableKey(): BrowserbaseKey | null {
  initializeIfNeeded()

  for (const state of keyStates.values()) {
    if (!state.isExhausted) {
      state.usageCount++
      return state.key
    }
  }

  console.warn("[browserbase-keys] All keys exhausted!")
  return null
}

/**
 * Mark a key as exhausted (hit 402 rate limit).
 * Call this when you receive a 402 error from Browserbase.
 */
export function markKeyExhausted(apiKey: string): void {
  const state = keyStates.get(apiKey)
  if (state) {
    state.isExhausted = true
    state.exhaustedAt = new Date()
    console.log(
      `[browserbase-keys] Marked "${state.key.name}" as exhausted after ${state.usageCount} uses`
    )
  }
}

/**
 * Reset all keys to available state.
 * Call this at the start of a new billing cycle or manually.
 */
export function resetAllKeys(): void {
  for (const state of keyStates.values()) {
    state.isExhausted = false
    state.exhaustedAt = undefined
    state.usageCount = 0
  }
  console.log("[browserbase-keys] All keys reset to available")
}

/**
 * Get status of all keys for debugging/monitoring.
 */
export function getKeyStatus(): {
  name: string
  isExhausted: boolean
  exhaustedAt?: Date
  usageCount: number
}[] {
  initializeIfNeeded()

  return Array.from(keyStates.values()).map((state) => ({
    name: state.key.name,
    isExhausted: state.isExhausted,
    exhaustedAt: state.exhaustedAt,
    usageCount: state.usageCount,
  }))
}

/**
 * Check if a 402 error indicates rate limit exhaustion.
 */
export function is402Error(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes("402")
  }
  return String(error).includes("402")
}

/**
 * Get count of available (non-exhausted) keys.
 */
export function getAvailableKeyCount(): number {
  initializeIfNeeded()

  let count = 0
  for (const state of keyStates.values()) {
    if (!state.isExhausted) count++
  }
  return count
}
