import { Home } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type Stop = {
  _id: string
  name: string
  order: number
  isStart?: boolean
  expectedMinutes: number
  status: 'pending' | 'polling' | 'captured' | 'missed'
  odometer?: number
  capturedAt?: number
}

const dotColor: Record<Stop['status'], string> = {
  pending: 'bg-neutral-400',
  polling: 'bg-amber-500',
  captured: 'bg-green-500',
  missed: 'bg-red-500',
}

const statusVariant = {
  pending: 'secondary',
  polling: 'outline',
  captured: 'default',
  missed: 'destructive',
} as const

function minutesToLabel(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function RouteStopsTimeline({ stops }: { stops: Stop[] }) {
  // Per-leg distance (this stop's odometer minus the previous stop's); the
  // start point is the baseline, carried forward across missing readings.
  const kmByStop = new Map<string, number | null>()
  let prevOdometer: number | null = null
  for (const stop of stops) {
    if (stop.isStart) {
      kmByStop.set(stop._id, null)
      prevOdometer = stop.odometer ?? prevOdometer
      continue
    }
    kmByStop.set(
      stop._id,
      stop.odometer != null && prevOdometer != null
        ? Math.max(0, stop.odometer - prevOdometer)
        : null,
    )
    prevOdometer = stop.odometer ?? prevOdometer
  }

  return (
    <ol className="relative">
      {stops.map((stop, index) => {
        const km = kmByStop.get(stop._id)
        const isLast = index === stops.length - 1
        return (
          <li key={stop._id} className="relative flex gap-3 pb-6 last:pb-0">
            {/* vertical connector to the next node */}
            {!isLast && (
              <span className="bg-border absolute top-7 left-[11px] h-[calc(100%-1.25rem)] w-px" />
            )}

            <span
              className={cn(
                'border-background relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white shadow',
                stop.isStart ? 'bg-indigo-600' : dotColor[stop.status],
              )}
            >
              {stop.isStart ? <Home className="size-3" /> : stop.order + 1}
            </span>

            <div className="-mt-0.5 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{stop.name}</span>
                <Badge
                  variant={statusVariant[stop.status]}
                  className="capitalize"
                >
                  {stop.isStart ? 'start' : stop.status}
                </Badge>
              </div>
              <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                <span>Exp {minutesToLabel(stop.expectedMinutes)}</span>
                {stop.odometer != null && (
                  <span>Odo {stop.odometer.toLocaleString()} km</span>
                )}
                {!stop.isStart && km != null && (
                  <span className="text-foreground font-medium">
                    {km.toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
                    km leg
                  </span>
                )}
                {stop.capturedAt != null && (
                  <span>
                    @ {new Date(stop.capturedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
