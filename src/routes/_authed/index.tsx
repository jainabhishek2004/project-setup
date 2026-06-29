import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import {
  CalendarDays,
  Gauge,
  Loader2,
  Map as MapIcon,
  Plus,
} from 'lucide-react'

import { api } from '~/convex/_generated/api'
import { Id } from '~/convex/_generated/dataModel'
import { operationalDateString } from '@/lib/date'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/_authed/')({
  component: Dashboard,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.auth.getCurrentUser, {}),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.dailyRoutes.byDate, { date: operationalDateString() }),
      ),
    ])
  },
})

function minutesToLabel(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const statusVariant = {
  pending: 'secondary',
  polling: 'outline',
  captured: 'default',
  missed: 'destructive',
  active: 'outline',
  completed: 'default',
} as const

function Dashboard() {
  const today = operationalDateString()
  const [selectedDate, setSelectedDate] = useState(today)
  const isToday = selectedDate === today

  const { data, isFetching } = useQuery({
    ...convexQuery(api.dailyRoutes.byDate, { date: selectedDate }),
    placeholderData: keepPreviousData,
  })

  const generate = useMutation(api.dailyRoutes.generateToday)
  const [generating, setGenerating] = useState(false)

  const dailyRoutes = data?.dailyRoutes ?? []

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await generate({})
      setSelectedDate(today)
      toast.success(
        res.created > 0
          ? `Generated ${res.created} route(s) for today`
          : 'Today is already up to date',
      )
    } catch (err) {
      toast.error('Could not generate daily routes')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl space-y-6 p-4">
      <AppHeader />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <CalendarDays size={20} /> Daily routes
            {isFetching && (
              <Loader2
                size={16}
                className="text-muted-foreground animate-spin"
              />
            )}
          </h2>
          <p className="text-muted-foreground text-sm">
            {selectedDate} · 5 PM–7 AM (IST){isToday && ' · today'}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1">
            <Label htmlFor="route-date" className="text-xs">
              Date
            </Label>
            <Input
              id="route-date"
              type="date"
              value={selectedDate}
              max={today}
              onChange={(e) => setSelectedDate(e.target.value || today)}
              className="w-40"
            />
          </div>
          {!isToday && (
            <Button variant="ghost" onClick={() => setSelectedDate(today)}>
              Today
            </Button>
          )}
          {isToday && (
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Generate today
            </Button>
          )}
        </div>
      </div>

      {dailyRoutes.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center">
            {isToday ? (
              <>
                No daily routes yet for today.{' '}
                <Link to="/routes" className="text-orange-400 underline">
                  Configure a route
                </Link>{' '}
                then click “Generate today”.
              </>
            ) : (
              <>No routes were recorded on {selectedDate}.</>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {dailyRoutes.map((dr) => (
            <DailyRouteCard key={dr._id} dailyRoute={dr} />
          ))}
        </div>
      )}

      <Toaster />
    </div>
  )
}

function DailyRouteCard({
  dailyRoute,
}: {
  dailyRoute: {
    _id: Id<'dailyRoutes'>
    routeName: string
    vehicleRegistration: string
    status: 'pending' | 'active' | 'completed'
    odometer?: number
    stops: Array<{
      _id: Id<'dailyStops'>
      name: string
      order: number
      isStart?: boolean
      expectedMinutes: number
      targetLat: number
      targetLng: number
      status: 'pending' | 'polling' | 'captured' | 'missed'
      odometer?: number
      lastDistanceMeters?: number
      capturedLat?: number
      capturedLng?: number
      capturedAt?: number
    }>
  }
}) {
  const setRouteOdometer = useMutation(api.dailyRoutes.setRouteOdometer)

  // Per-leg distance: each stop's odometer minus the previous stop's
  // (point2 - point1). The start point is 0. We carry forward the last known
  // odometer so a single missing reading doesn't blank every downstream leg.
  const kmTravelledByStop = useMemo(() => {
    const result = new Map<Id<'dailyStops'>, number | null>()
    let prevOdometer: number | null = null
    // dailyRoute.stops is already ordered (start first, then drop points).
    for (const stop of dailyRoute.stops) {
      if (stop.isStart) {
        result.set(stop._id, 0)
        prevOdometer = stop.odometer ?? prevOdometer
        continue
      }
      const km =
        stop.odometer != null && prevOdometer != null
          ? Math.max(0, stop.odometer - prevOdometer)
          : null
      result.set(stop._id, km)
      prevOdometer = stop.odometer ?? prevOdometer
    }
    return result
  }, [dailyRoute.stops])

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            {dailyRoute.routeName}
            <Badge variant={statusVariant[dailyRoute.status]}>
              {dailyRoute.status}
            </Badge>
          </CardTitle>
          <CardDescription>
            Vehicle {dailyRoute.vehicleRegistration}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link
              to="/daily/$dailyRouteId"
              params={{ dailyRouteId: dailyRoute._id }}
            >
              <MapIcon className="size-4" /> Map
            </Link>
          </Button>
          <OdometerControl
            label="Route odometer"
            value={dailyRoute.odometer}
            onSave={(odometer) =>
              setRouteOdometer({ id: dailyRoute._id, odometer })
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Drop point</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead>Location (lat, lng)</TableHead>
              <TableHead>Status</TableHead>

              <TableHead>Odometer</TableHead>
              <TableHead>Km travelled</TableHead>
              <TableHead>Captured (Lat, Lng)</TableHead>
              <TableHead>Captured Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dailyRoute.stops.map((stop) => (
              <TableRow key={stop._id}>
                <TableCell>
                  {stop.isStart ? (
                    <Badge variant="outline">Start</Badge>
                  ) : (
                    stop.order + 1
                  )}
                </TableCell>
                <TableCell className="font-medium">{stop.name}</TableCell>
                <TableCell>{minutesToLabel(stop.expectedMinutes)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {stop.targetLat.toFixed(5)}, {stop.targetLng.toFixed(5)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[stop.status]}>
                    {stop.status}
                  </Badge>
                  {stop.status === 'polling' &&
                    stop.lastDistanceMeters != null && (
                      <div className="text-muted-foreground mt-1 text-xs">
                        {Math.round(stop.lastDistanceMeters)} m away
                      </div>
                    )}
                </TableCell>
                <TableCell>
                  <StopOdometerControl
                    stopId={stop._id}
                    value={stop.odometer}
                  />
                </TableCell>
                <TableCell>
                  {(() => {
                    const km = kmTravelledByStop.get(stop._id)
                    return km != null ? (
                      <span className="font-medium">
                        {km.toLocaleString(undefined, {
                          maximumFractionDigits: 1,
                        })}{' '}
                        km
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )
                  })()}
                </TableCell>
                <TableCell>
                  {stop.capturedLat != null && stop.capturedLng != null ? (
                    <span>
                      {stop.capturedLat.toFixed(5)},{' '}
                      {stop.capturedLng.toFixed(5)}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>
                  {stop.status === 'captured' && stop.capturedAt != null ? (
                    <span>
                      {new Date(stop.capturedAt).toLocaleTimeString()}
                    </span>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function StopOdometerControl({
  stopId,
  value,
}: {
  stopId: Id<'dailyStops'>
  value?: number
}) {
  const setStopOdometer = useMutation(api.dailyRoutes.setStopOdometer)
  return (
    <OdometerControl
      value={value}
      onSave={(odometer) => setStopOdometer({ id: stopId, odometer })}
    />
  )
}

function OdometerControl({
  value,
  onSave,
  label,
}: {
  value?: number
  onSave: (odometer: number) => Promise<unknown>
  label?: string
}) {
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const odometer = Number(draft)
    if (!draft || Number.isNaN(odometer)) {
      toast.error('Enter a valid odometer reading')
      return
    }
    setSaving(true)
    try {
      await onSave(odometer)
      setDraft('')
      toast.success('Odometer saved')
    } catch (err) {
      toast.error('Could not save odometer')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {value != null && (
        <span className="flex items-center gap-1 text-sm font-medium">
          <Gauge size={14} /> {value.toLocaleString()} km
        </span>
      )}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={label ?? 'Odometer'}
        inputMode="numeric"
        className="h-8 w-28"
      />
      <Button
        size="sm"
        variant="secondary"
        disabled={saving}
        onClick={handleSave}
      >
        Set
      </Button>
    </div>
  )
}
