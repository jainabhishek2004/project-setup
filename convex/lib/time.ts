// IST is a fixed UTC+5:30 offset with no daylight saving, so we can convert
// without a date library by shifting epoch milliseconds.
const IST_OFFSET_MIN = 330
const MS_PER_MIN = 60_000

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

// "YYYY-MM-DD" for the given epoch ms, interpreted in IST.
export function istDateString(nowMs: number): string {
  const d = new Date(nowMs + IST_OFFSET_MIN * MS_PER_MIN)
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

// "HH:mm" label for minutes-from-midnight (IST local clock).
export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${pad2(h)}:${pad2(m)}`
}

// Epoch ms for 00:00 IST on the given "YYYY-MM-DD" date.
export function istMidnightUtcMs(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  // 00:00 UTC on that date, shifted back 5:30 to land on 00:00 IST.
  return Date.UTC(y, m - 1, d, 0, 0, 0) - IST_OFFSET_MIN * MS_PER_MIN
}

// Epoch ms for a given minutes-from-midnight (IST) on the given date.
export function expectedAtMs(dateStr: string, minutes: number): number {
  return istMidnightUtcMs(dateStr) + minutes * MS_PER_MIN
}

export const POLL_WINDOW_MS = 30 * MS_PER_MIN
