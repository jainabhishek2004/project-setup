import { MapPin } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type Visit = {
  _id: string
  enteredAt: number
  odometer?: number
  dwellSeconds?: number
  distanceMeters: number
}

type Stop = {
  _id: string
  name: string
  order: number
  optional?: boolean
  radiusMeters?: number
  visits: Visit[]
}

function clockTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function RouteStopsTimeline({ stops }: { stops: Stop[] }) {
  return (
    <ol className="relative">
      {stops.map((stop, index) => {
        const isLast = index === stops.length - 1
        const visited = stop.visits.length > 0
        return (
          <li key={stop._id} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span className="bg-border absolute top-7 left-[11px] h-[calc(100%-1.25rem)] w-px" />
            )}

            <span
              className={cn(
                'border-background relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white shadow',
                visited ? 'bg-green-500' : 'bg-neutral-400',
              )}
            >
              {stop.order + 1}
            </span>

            <div className="-mt-0.5 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <MapPin size={13} /> {stop.name}
                  {stop.optional && (
                    <span className="text-muted-foreground text-[10px] font-normal">
                      (optional)
                    </span>
                  )}
                </span>
                <Badge variant={visited ? 'default' : 'secondary'}>
                  {stop.visits.length} visit(s)
                </Badge>
              </div>
              {visited && (
                <ul className="text-muted-foreground space-y-0.5 text-xs">
                  {stop.visits.map((visit) => (
                    <li
                      key={visit._id}
                      className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5"
                    >
                      <span className="text-foreground font-medium">
                        {clockTime(visit.enteredAt)}
                      </span>
                      {visit.odometer != null && (
                        <span>{visit.odometer.toLocaleString()} km</span>
                      )}
                      {visit.dwellSeconds != null && (
                        <span>{Math.round(visit.dwellSeconds / 60)} min</span>
                      )}
                      <span>{Math.round(visit.distanceMeters)} m</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
