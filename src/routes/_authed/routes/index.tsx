import { createFileRoute, Link } from '@tanstack/react-router'
import { Toaster, toast } from 'sonner'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { Pencil, Plus, Trash2, Truck } from 'lucide-react'

import { api } from '~/convex/_generated/api'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

export const Route = createFileRoute('/_authed/routes/')({
  component: RoutesList,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.auth.getCurrentUser, {}),
      ),
      context.queryClient.ensureQueryData(convexQuery(api.routes.list, {})),
    ])
  },
})

function minutesToLabel(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function RoutesList() {
  const { data: routes } = useSuspenseQuery(convexQuery(api.routes.list, {}))
  const setActive = useMutation(api.routes.setActive)
  const remove = useMutation(api.routes.remove)

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl space-y-6 p-4">
      <AppHeader />

      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Truck size={20} /> Configured routes
        </h2>
        <Button asChild>
          <Link to="/routes/new">
            <Plus size={16} /> New route
          </Link>
        </Button>
      </div>

      {routes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No routes configured yet. Create your first route to start tracking.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {routes.map((route) => (
            <Card key={route._id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {route.name}
                    {!route.isActive && (
                      <Badge variant="secondary">inactive</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Vehicle {route.vehicleRegistration} · {route.stops.length}{' '}
                    drop point(s)
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/routes/$routeId" params={{ routeId: route._id }}>
                      <Pencil size={16} />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-500"
                    onClick={async () => {
                      if (!confirm(`Delete route "${route.name}"?`)) return
                      await remove({ id: route._id })
                      toast.success('Route deleted')
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="space-y-1 text-sm">
                  {route.stops.map((stop) => (
                    <li
                      key={stop._id}
                      className="flex justify-between text-muted-foreground"
                    >
                      <span>
                        {stop.order + 1}. {stop.name}
                      </span>
                      <span>{minutesToLabel(stop.expectedMinutes)}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="link"
                  size="sm"
                  className="px-0"
                  onClick={() =>
                    setActive({ id: route._id, isActive: !route.isActive })
                  }
                >
                  {route.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Toaster />
    </div>
  )
}
