import { createFileRoute, Link } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useState } from 'react'
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

export const Route = createFileRoute('/_authed/daily/$dailyRouteId')({
  component: MapPage,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.auth.getCurrentUser, {}),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.dailyRoutes.getDailyRoute, {
          id: params.dailyRouteId as Id<'dailyRoutes'>,
        }),
      ),
    ])
  },
})

function MapPage() {
  const { dailyRouteId } = Route.useParams()
  const { data } = useSuspenseQuery(
    convexQuery(api.dailyRoutes.getDailyRoute, {
      id: dailyRouteId as Id<'dailyRoutes'>,
    }),
  )

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

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
        <h1 className="text-2xl font-semibold">{data.routeName}</h1>
        <p className="text-muted-foreground text-sm">
          Drop points and live location for {data.vehicleRegistration}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Map — larger, left */}
        <div className="lg:col-span-2">
          {mounted ? (
            <Suspense fallback={mapFallback}>
              <RouteMap
                vehicleRegistration={data.vehicleRegistration}
                stops={data.stops}
                mapClassName="h-[72vh]"
              />
            </Suspense>
          ) : (
            mapFallback
          )}
        </div>

        {/* Drop points — vertical connected timeline, right */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">
              Drop points ({data.stops.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[72vh] overflow-y-auto">
            <RouteStopsTimeline stops={data.stops} />
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  )
}
