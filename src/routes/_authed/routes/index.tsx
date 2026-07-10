import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Toaster, toast } from 'sonner'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { Pencil, Plus, Trash2, Truck } from 'lucide-react'

import { api } from '~/convex/_generated/api'
import { Id } from '~/convex/_generated/dataModel'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
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
} from '@/components/ui/alert-dialog'

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
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  // The route pending deletion (drives a single confirm dialog).
  const [toDelete, setToDelete] = useState<{
    id: Id<'routes'>
    name: string
  } | null>(null)

  const q = query.trim().toLowerCase()
  const filtered = q
    ? routes.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.vehicleRegistration.toLowerCase().includes(q),
      )
    : routes

  const openDetail = (id: Id<'routes'>) =>
    navigate({ to: '/routes/$routeId', params: { routeId: id } })

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl space-y-6 p-4">
      <AppHeader />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Truck size={20} /> Configured routes
        </h2>
        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or vehicle…"
            className="w-56"
          />
          <Button asChild>
            <Link to="/routes/new">
              <Plus size={16} /> New route
            </Link>
          </Button>
        </div>
      </div>

      {routes.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center">
            No routes configured yet. Create your first route to start tracking.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Active hours</TableHead>
                  <TableHead className="text-right">Hubs</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((route) => (
                  <TableRow
                    key={route._id}
                    className="cursor-pointer"
                    onClick={() => openDetail(route._id)}
                  >
                    <TableCell className="font-medium">{route.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {route.vehicleRegistration}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {route.activeStartMinutes != null &&
                      route.activeEndMinutes != null
                        ? `${minutesToLabel(route.activeStartMinutes)}–${minutesToLabel(
                            route.activeEndMinutes,
                          )}`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {route.stops.length}
                    </TableCell>
                    {/* Toggle — stop row navigation on interaction. */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={route.isActive}
                        onCheckedChange={(v) =>
                          setActive({ id: route._id, isActive: v })
                        }
                        aria-label="Active"
                      />
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            to="/routes/$routeId/edit"
                            params={{ routeId: route._id }}
                          >
                            <Pencil size={16} />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-red-500"
                          onClick={() =>
                            setToDelete({ id: route._id, name: route.name })
                          }
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground py-8 text-center"
                    >
                      No routes match “{query}”.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{toDelete?.name}”?</AlertDialogTitle>
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
                if (!toDelete) return
                await remove({ id: toDelete.id })
                toast.success('Route deleted')
                setToDelete(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}
