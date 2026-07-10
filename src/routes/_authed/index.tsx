import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import {
  CalendarDays,
  Gauge,
  Loader2,
  Map as MapIcon,
  MapPin,
} from 'lucide-react'

import type { FunctionReturnType } from 'convex/server'
import { api } from '~/convex/_generated/api'
import { operationalDateString } from '@/lib/date'
import { AppHeader } from '@/components/AppHeader'
import { RouteDayOverrideDialog } from '@/components/RouteDayOverrideDialog'
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

export const Route = createFileRoute('/_authed/')({
  component: Dashboard,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.auth.getCurrentUser, {}),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.visits.dashboard, { date: operationalDateString() }),
      ),
    ])
  },
})

function minutesToLabel(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Add days to a "YYYY-MM-DD" string (UTC math, no timezone drift).
function addDays(dateStr: string, n: number) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + n)
  const p = (x: number) => String(x).padStart(2, '0')
  return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`
}

function clockTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Dashboard() {
  const today = operationalDateString()
  const [selectedDate, setSelectedDate] = useState(today)
  const isToday = selectedDate === today
  const isFuture = selectedDate > today
  const maxDate = addDays(today, 14)

  const { data, isFetching } = useQuery({
    ...convexQuery(api.visits.dashboard, { date: selectedDate }),
    placeholderData: keepPreviousData,
  })

  const routes = data?.routes ?? []

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl space-y-6 p-4">
      <AppHeader />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <CalendarDays size={20} /> Visits
            {isFetching && (
              <Loader2
                size={16}
                className="text-muted-foreground animate-spin"
              />
            )}
          </h2>
          <p className="text-muted-foreground text-sm">
            {selectedDate} · 5 PM–7 AM (IST)
            {isToday && ' · today'}
            {isFuture && ' · upcoming'}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1">
            <Label htmlFor="route-date" className="text-xs">
              Date (pick a future day to pre-assign a vehicle)
            </Label>
            <Input
              id="route-date"
              type="date"
              value={selectedDate}
              max={maxDate}
              onChange={(e) => setSelectedDate(e.target.value || today)}
              className="w-40"
            />
          </div>
          {!isToday && (
            <Button variant="ghost" onClick={() => setSelectedDate(today)}>
              Today
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            disabled={selectedDate >= maxDate}
          >
            Next day →
          </Button>
        </div>
      </div>

      {routes.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center">
            No routes configured.{' '}
            <Link to="/routes" className="text-orange-400 underline">
              Create a route
            </Link>{' '}
            to start tracking visits.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {routes.map((route) => (
            <RouteVisitsCard
              key={route._id}
              route={route}
              date={selectedDate}
            />
          ))}
        </div>
      )}

      <Toaster />
    </div>
  )
}

type DashboardRoute = FunctionReturnType<
  typeof api.visits.dashboard
>['routes'][number]

function RouteVisitsCard({
  route,
  date,
}: {
  route: DashboardRoute
  date: string
}) {
  // Ad-hoc routes visit an unpredictable subset of the configured hubs, so we
  // show only what was actually visited, ordered by when it happened — not a
  // "hit/total" ratio or a list of everything that wasn't touched.
  const visitedStops = [...route.stops]
    .filter((s) => s.visits.length > 0)
    .sort((a, b) => a.visits[0].enteredAt - b.visits[0].enteredAt)

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            {route.name}
            {!route.isActive && <Badge variant="secondary">inactive</Badge>}
            {route.override && (
              <Badge
                variant={route.override.trackable ? 'outline' : 'destructive'}
              >
                {route.override.trackable
                  ? 'substitute'
                  : (route.override.vendorName ?? 'vendor')}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Vehicle {route.effectiveVehicle}
            {route.override && <> (default {route.vehicleRegistration})</>}
            {route.activeStartMinutes != null &&
              route.activeEndMinutes != null && (
                <>
                  {' '}
                  · {minutesToLabel(route.activeStartMinutes)}–
                  {minutesToLabel(route.activeEndMinutes)}
                </>
              )}{' '}
            · {visitedStops.length} hub
            {visitedStops.length === 1 ? '' : 's'} visited · {route.totalVisits}{' '}
            visit(s)
            {route.override?.vendorCost != null && (
              <> · vendor cost ₹{route.override.vendorCost.toLocaleString()}</>
            )}
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          {route.billableKm != null && (
            <span className="flex items-center gap-1 text-sm font-medium">
              <Gauge size={14} /> {route.billableKm.toLocaleString()} km
            </span>
          )}
          <RouteDayOverrideDialog
            routeId={route._id}
            date={date}
            defaultVehicle={route.vehicleRegistration}
            override={route.override}
          />
          <Button variant="outline" size="sm" asChild>
            <Link to="/daily/$routeId" params={{ routeId: route._id }}>
              <MapIcon className="size-4" /> Map
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {visitedStops.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No hubs visited yet today.
          </p>
        ) : (
          visitedStops.map((stop) => (
            <div key={stop._id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <MapPin size={14} /> {stop.name}
                </span>
                {stop.visits.length > 1 && (
                  <Badge>{stop.visits.length} visits</Badge>
                )}
              </div>
              <ul className="text-muted-foreground mt-2 space-y-1 text-xs">
                {stop.visits.map((visit) => (
                  <li
                    key={visit._id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-0.5"
                  >
                    <span className="text-foreground font-medium">
                      {clockTime(visit.enteredAt)}
                    </span>
                    {visit.odometer != null && (
                      <span>odo {visit.odometer.toLocaleString()} km</span>
                    )}
                    {visit.dwellSeconds != null && (
                      <span>
                        {Math.round(visit.dwellSeconds / 60)} min stay
                      </span>
                    )}
                    <span>
                      {Math.round(visit.distanceMeters)} m from centre
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
