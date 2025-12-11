export function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw || raw === 'undefined') return fallback
    return JSON.parse(raw) as T
  } catch (e) {
    return fallback
  }
}

export function safeSetJSON<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    // ignore
  }
}

// Remove keys whose value is the literal string 'undefined' or which are unparsable
export function sanitizeLocalStorage(keysToKeep?: string[]) {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      // If keysToKeep is provided, skip those keys
      if (keysToKeep && keysToKeep.includes(key)) continue
      const raw = localStorage.getItem(key)
      if (raw === null) continue
      if (raw === 'undefined') {
        localStorage.removeItem(key)
        // adjust index because length changed
        i--
        continue
      }
      // try parse to see if it's valid JSON (if it looks like JSON)
      const looksLikeJSON = raw.trim().startsWith('{') || raw.trim().startsWith('[')
      if (looksLikeJSON) {
        try {
          JSON.parse(raw)
        } catch (e) {
          localStorage.removeItem(key)
          i--
        }
      }
    }
  } catch (e) {
    // ignore any problems during sanitization
  }
}
