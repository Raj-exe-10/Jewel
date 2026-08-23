const STORAGE_KEY = 'amore:search-history'
const MAX_HISTORY = 8

export function readSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  } catch {
    return []
  }
}

export function pushSearchHistory(term: string): string[] {
  const cleaned = term.trim()
  if (!cleaned) return readSearchHistory()

  const next = [cleaned, ...readSearchHistory().filter((item) => item.toLowerCase() !== cleaned.toLowerCase())].slice(
    0,
    MAX_HISTORY,
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function removeSearchHistory(term: string): string[] {
  const cleaned = term.trim().toLowerCase()
  if (!cleaned) return readSearchHistory()

  const next = readSearchHistory().filter((item) => item.toLowerCase() !== cleaned)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function clearSearchHistory(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
}
