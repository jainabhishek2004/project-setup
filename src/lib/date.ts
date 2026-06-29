// IST is a fixed UTC+5:30 offset (no DST), so we derive the IST calendar date
// by shifting the epoch and reading UTC parts. Mirrors convex/lib/time.ts.
const IST_OFFSET_MIN = 330
const DAY_START_MIN = 17 * 60 // operational day starts at 5 PM IST

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`
}

function formatYMD(d: Date) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

// "YYYY-MM-DD" for today in IST (or for the given epoch ms).
export function istDateString(nowMs: number = Date.now()): string {
  return formatYMD(new Date(nowMs + IST_OFFSET_MIN * 60_000))
}

// The operational-day label (5 PM → 7 AM next day). Before 5 PM IST we are
// still in the window that opened the previous calendar day. Mirrors the
// server's convex/lib/time.ts so the dashboard default matches stored dates.
export function operationalDateString(nowMs: number = Date.now()): string {
  const d = new Date(nowMs + IST_OFFSET_MIN * 60_000)
  const minutes = d.getUTCHours() * 60 + d.getUTCMinutes()
  if (minutes < DAY_START_MIN) {
    d.setUTCDate(d.getUTCDate() - 1)
  }
  return formatYMD(d)
}
