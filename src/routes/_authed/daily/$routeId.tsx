import { createFileRoute, Link } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Toaster } from 'sonner'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { api } from '~/convex/_generated/api'
import { Id } from '~/convex/_generated/dataModel'
import { AppHeader } from '@/components/AppHeader'
import { RouteStopsTimeline } from '@/components/RouteStopsTimeline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Lazy + client-only so maplibre-gl is never evaluated during SSR.
const RouteMap = lazy(() =>
  import('@/components/RouteMap').then((m) => ({ default: m.RouteMap })),
)

export const Route = createFileRoute('/_authed/daily/$routeId')({
  component: MapPage,
  loader: async ({ context, params }) => {
    const id = params.routeId as Id<'routes'>
    await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.auth.getCurrentUser, {}),
      ),
      context.queryClient.ensureQueryData(convexQuery(api.routes.get, { id })),
      context.queryClient.ensureQueryData(
        convexQuery(api.visits.byRouteDate, { routeId: id }),
      ),
    ])
  },
})

function MapPage() {
  const { routeId } = Route.useParams()
  const id = routeId as Id<'routes'>
  const { data: route } = useSuspenseQuery(convexQuery(api.routes.get, { id }))
  const { data: visitsData } = useSuspenseQuery(
    convexQuery(api.visits.byRouteDate, { routeId: id }),
  )

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Group visits by drop point.
  const visitsByStop = useMemo(() => {
    const map = new Map<string, typeof visitsData.visits>()
    for (const visit of visitsData.visits) {
      const key = visit.routeStopId as string
      const arr = map.get(key) ?? []
      arr.push(visit)
      map.set(key, arr)
    }
    return map
  }, [visitsData.visits])

  const mapStops = route.stops.map((s) => {
    const visits = visitsByStop.get(s._id as string) ?? []
    const last = visits[visits.length - 1]
    const status: 'captured' | 'pending' =
      visits.length > 0 ? 'captured' : 'pending'
    return {
      name: s.name,
      order: s.order,
      optional: s.optional,
      targetLat: s.lat,
      targetLng: s.lng,
      status,
      odometer: last?.odometer,
    }
  })

  const timelineStops = route.stops.map((s) => ({
    _id: s._id as string,
    name: s.name,
    order: s.order,
    optional: s.optional,
    radiusMeters: s.radiusMeters,
    visits: (visitsByStop.get(s._id as string) ?? []).map((v) => ({
      _id: v._id as string,
      enteredAt: v.enteredAt,
      odometer: v.odometer,
      dwellSeconds: v.dwellSeconds,
      distanceMeters: v.distanceMeters,
    })),
  }))

  const mapFallback = (
    <div className="flex h-[72vh] items-center justify-center rounded-lg border">
      <Loader2 className="text-muted-foreground size-6 animate-spin" />
    </div>
  )

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl space-y-4 p-4">
      <AppHeader />

      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link to="/">
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold">{route.name}</h1>
        <p className="text-muted-foreground text-sm">
          Drop points and live location for {route.vehicleRegistration} ·{' '}
          {visitsData.visits.length} visit(s) today
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {mounted ? (
            <Suspense fallback={mapFallback}>
              <RouteMap
                vehicleRegistration={route.vehicleRegistration}
                stops={mapStops}
                mapClassName="h-[72vh]"
              />
            </Suspense>
          ) : (
            mapFallback
          )}
        </div>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">
              Drop points ({route.stops.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[72vh] overflow-y-auto">
            <RouteStopsTimeline stops={timelineStops} />
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  )
}
