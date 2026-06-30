// IST is a fixed UTC+5:30 offset with no daylight saving, so we can convert
// without a date library by shifting epoch milliseconds.
const IST_OFFSET_MIN = 330
const MS_PER_MIN = 60_000
const MS_PER_DAY = 24 * 60 * MS_PER_MIN

// The operational day does NOT run midnight-to-midnight. It starts at 5 PM (IST)
// and runs to 7 AM the next calendar day. So "day D" = [D 17:00, (D+1) 07:00].
// DAY_START_MIN is the minutes-from-midnight boundary used to decide which
// operational day a clock time / expected time belongs to.
export const DAY_START_MIN = 17 * 60 // 5 PM

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function formatYMD(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

// Plain calendar "YYYY-MM-DD" for the given epoch ms, interpreted in IST.
export function istDateString(nowMs: number): string {
  return formatYMD(new Date(nowMs + IST_OFFSET_MIN * MS_PER_MIN))
}

// The operational-day label for an instant: the calendar date of the 5 PM that
// opened the current window. Before 5 PM IST (including the early morning and
// the 7 AM–5 PM gap) we are still in the window that started the previous day.
export function operationalDateString(nowMs: number): string {
  const d = new Date(nowMs + IST_OFFSET_MIN * MS_PER_MIN)
  const minutes = d.getUTCHours() * 60 + d.getUTCMinutes()
  if (minutes < DAY_START_MIN) {
    d.setUTCDate(d.getUTCDate() - 1)
  }
  return formatYMD(d)
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

// Absolute epoch ms for a stop's expected time within operational day `dateStr`.
// Times at/after 5 PM fall on `dateStr` itself; times before 5 PM (the early
// morning of the window) roll over to the next calendar day.
export function expectedAtMs(dateStr: string, minutes: number): number {
  const base = istMidnightUtcMs(dateStr) + minutes * MS_PER_MIN
  return minutes < DAY_START_MIN ? base + MS_PER_DAY : base
}

export const POLL_WINDOW_MS = 30 * MS_PER_MIN

// Absolute [startAt, endAt] of a route's active-hours window for the operational
// day containing `nowMs`. Reuses expectedAtMs so morning hours (e.g. 2 AM) land
// on the correct calendar day within the 5 PM–7 AM operational span.
export function activeWindowMs(
  nowMs: number,
  startMinutes: number,
  endMinutes: number,
): { startAt: number; endAt: number } {
  const date = operationalDateString(nowMs)
  return {
    startAt: expectedAtMs(date, startMinutes),
    endAt: expectedAtMs(date, endMinutes),
  }
}

export function isWithinActiveWindow(
  nowMs: number,
  startMinutes: number,
  endMinutes: number,
): boolean {
  const { startAt, endAt } = activeWindowMs(nowMs, startMinutes, endMinutes)
  return nowMs >= startAt && nowMs <= endAt
}
