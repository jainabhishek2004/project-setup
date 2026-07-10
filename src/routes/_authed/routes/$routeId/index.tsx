import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Toaster, toast } from 'sonner'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { ArrowLeft, Map as MapIcon, Pencil, Trash2 } from 'lucide-react'

import { api } from '~/convex/_generated/api'
import { Id } from '~/convex/_generated/dataModel'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export const Route = createFileRoute('/_authed/routes/$routeId/')({
  component: RouteDetail,
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

function minutesToLabel(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function RouteDetail() {
  const { routeId } = Route.useParams()
  const id = routeId as Id<'routes'>
  const navigate = useNavigate()
  const { data: route } = useSuspenseQuery(convexQuery(api.routes.get, { id }))
  const setActive = useMutation(api.routes.setActive)
  const remove = useMutation(api.routes.remove)

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl space-y-4 p-4">
      <AppHeader />

      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link to="/routes">
          <ArrowLeft className="size-4" /> Back to routes
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              {route.name}
              <Badge variant={route.isActive ? 'default' : 'secondary'}>
                {route.isActive ? 'active' : 'inactive'}
              </Badge>
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Vehicle <b>{route.vehicleRegistration}</b>
              {route.activeStartMinutes != null &&
                route.activeEndMinutes != null && (
                  <>
                    {' '}
                    · active {minutesToLabel(route.activeStartMinutes)}–
                    {minutesToLabel(route.activeEndMinutes)}
                  </>
                )}{' '}
              · {route.stops.length} drop point(s)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={route.isActive}
                onCheckedChange={(v) => setActive({ id, isActive: v })}
              />
              <Label htmlFor="active" className="text-sm">
                Active
              </Label>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/daily/$routeId" params={{ routeId: id }}>
                <MapIcon className="size-4" /> Map
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/routes/$routeId/edit" params={{ routeId: id }}>
                <Pencil className="size-4" /> Edit
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete “{route.name}”?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes the route and its drop points. Past
                    visits and overrides are kept. This can't be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={async () => {
                      await remove({ id })
                      toast.success('Route deleted')
                      await navigate({ to: '/routes' })
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>

        <CardContent>
          <h3 className="mb-2 text-sm font-medium">Drop points</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Latitude</TableHead>
                <TableHead>Longitude</TableHead>
                <TableHead className="text-right">Radius</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {route.stops.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>{s.order + 1}</TableCell>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {s.name}
                      {s.optional && (
                        <Badge variant="secondary" className="font-normal">
                          optional
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.lat.toFixed(5)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.lng.toFixed(5)}
                  </TableCell>
                  <TableCell className="text-right">
                    {s.radiusMeters ?? 100} m
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}
