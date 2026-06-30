import { createFileRoute } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'

import { api } from '~/convex/_generated/api'
import { Id } from '~/convex/_generated/dataModel'
import { AppHeader } from '@/components/AppHeader'
import { RouteForm } from '@/components/RouteForm'

export const Route = createFileRoute('/_authed/routes/$routeId')({
  component: EditRoute,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.auth.getCurrentUser, {}),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.routes.get, { id: params.routeId as Id<'routes'> }),
      ),
    ])
  },
})

function EditRoute() {
  const { routeId } = Route.useParams()
  const { data: route } = useSuspenseQuery(
    convexQuery(api.routes.get, { id: routeId as Id<'routes'> }),
  )

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl space-y-6 p-4">
      <AppHeader />
      <RouteForm
        initial={{
          id: route._id,
          name: route.name,
          vehicleRegistration: route.vehicleRegistration,
          activeStartMinutes: route.activeStartMinutes,
          activeEndMinutes: route.activeEndMinutes,
          stops: route.stops.map((s) => ({
            name: s.name,
            lat: s.lat,
            lng: s.lng,
            radiusMeters: s.radiusMeters,
          })),
        }}
      />
      <Toaster />
    </div>
  )
}
