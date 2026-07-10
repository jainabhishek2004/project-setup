import { useEffect, useMemo, useState } from 'react'
import { useAction } from 'convex/react'
import {
  Home,
  Loader2,
  RefreshCw,
  Route as RouteIcon,
  Truck,
} from 'lucide-react'

import { api } from '~/convex/_generated/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
} from '@/components/ui/map'

type Stop = {
  name: string
  order: number
  isStart?: boolean
  optional?: boolean
  targetLat: number
  targetLng: number
  status: 'pending' | 'polling' | 'captured' | 'missed'
  odometer?: number
}

type VehiclePosition = {
  lat: number
  lng: number
  odometer?: number
  speed?: number
  capturedAt: number
}

type RouteResult = {
  geometry: Array<[number, number]>
  order: number[]
  distanceMeters: number
  durationSeconds: number
}

const stopColor: Record<Stop['status'], string> = {
  pending: 'bg-neutral-400',
  polling: 'bg-amber-500',
  captured: 'bg-green-500',
  missed: 'bg-red-500',
}

const ROUTE_COLOR = '#10b981' // emerald solid = regular / suggested route

function computeBounds(
  points: Array<[number, number]>,
): [[number, number], [number, number]] | null {
  if (points.length === 0) return null
  let minLng = points[0][0]
  let maxLng = points[0][0]
  let minLat = points[0][1]
  let maxLat = points[0][1]
  for (const [lng, lat] of points) {
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

export function RouteMap({
  vehicleRegistration,
  stops,
  mapClassName = 'h-[60vh] max-h-[480px]',
}: {
  vehicleRegistration: string
  stops: Stop[]
  mapClassName?: string
}) {
  const getPosition = useAction(api.vehicles.getCurrentPosition)
  const getPlanned = useAction(api.routing.getPlannedRoute)
  const getOptimized = useAction(api.routing.getOptimizedRoute)

  const [vehicle, setVehicle] = useState<VehiclePosition | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // false = regular route (planned hubs in configured order); true = suggested
  // better order (OSRM TSP over the planned hubs).
  const [optimize, setOptimize] = useState(false)
  const [route, setRoute] = useState<RouteResult | null>(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState<string | null>(null)

  const sorted = useMemo(
    () => [...stops].sort((a, b) => a.order - b.order),
    [stops],
  )
  // Planned (core) hubs form the regular route; optional hubs are ad-hoc.
  const plannedStops = useMemo(
    () => sorted.filter((s) => !s.optional),
    [sorted],
  )
  const optionalStops = useMemo(
    () => sorted.filter((s) => s.optional),
    [sorted],
  )

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const reading = await getPosition({ vehicleRegistration })
      if (reading) setVehicle(reading)
      else setError('No live location available for this vehicle')
    } catch (err) {
      console.error(err)
      setError('Could not fetch vehicle location')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleRegistration])

  const plannedCoords = useMemo(
    () => plannedStops.map((s) => ({ lat: s.targetLat, lng: s.targetLng })),
    [plannedStops],
  )
  const routeKey = useMemo(
    () =>
      `${optimize}|` +
      plannedCoords
        .map((c) => `${c.lat.toFixed(6)},${c.lng.toFixed(6)}`)
        .join(';'),
    [optimize, plannedCoords],
  )

  // Compute the route line over the planned hubs (fixed order, or TSP if optimize).
  useEffect(() => {
    if (plannedCoords.length < 2) {
      setRoute(null)
      return
    }
    let cancelled = false
    setRouteLoading(true)
    setRouteError(null)
    const fn = optimize ? getOptimized : getPlanned
    fn({ coordinates: plannedCoords })
      .then((r) => {
        if (cancelled) return
        if (r) setRoute(r)
        else setRouteError('No route found')
      })
      .catch((err) => {
        if (cancelled) return
        console.error(err)
        setRouteError('Could not compute route')
      })
      .finally(() => {
        if (!cancelled) setRouteLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey])

  // The planned hubs in the route's visiting order (for the "Order: …" text).
  const orderedStops = useMemo(() => {
    if (!route) return plannedStops
    return route.order.map((i) => plannedStops[i]).filter(Boolean)
  }, [route, plannedStops])

  const bounds = useMemo(() => {
    const pts = sorted.map(
      (s) => [s.targetLng, s.targetLat] as [number, number],
    )
    if (vehicle) pts.push([vehicle.lng, vehicle.lat])
    return computeBounds(pts)
  }, [sorted, vehicle])
  const center: [number, number] = bounds
    ? [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2]
    : [77.209, 28.6139]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-muted-foreground text-sm">
          {vehicle ? (
            <span>
              Vehicle at {vehicle.lat.toFixed(5)}, {vehicle.lng.toFixed(5)}
              {vehicle.speed != null && ` · ${Math.round(vehicle.speed)} km/h`}
            </span>
          ) : error ? (
            <span className="text-red-500">{error}</span>
          ) : (
            <span>Locating vehicle…</span>
          )}
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={refresh}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Route summary + legend */}
      <div className="bg-muted/40 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border px-3 py-2 text-xs">
        <span className="flex items-center gap-1.5 font-medium">
          <RouteIcon className="size-3.5" />
          {optimize ? 'Suggested order' : 'Regular route'}
        </span>
        {routeLoading ? (
          <span className="text-muted-foreground flex items-center gap-1">
            <Loader2 className="size-3 animate-spin" /> computing…
          </span>
        ) : route ? (
          <>
            <span>{(route.distanceMeters / 1000).toFixed(1)} km</span>
            <span>~{Math.round(route.durationSeconds / 60)} min</span>
            {orderedStops.length > 0 && (
              <span className="text-muted-foreground">
                Order: {orderedStops.map((s) => s.name).join(' → ')}
              </span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground">
            {plannedStops.length < 2
              ? 'need 2+ planned hubs'
              : (routeError ?? 'unavailable')}
          </span>
        )}
        <span className="ml-auto flex items-center gap-3">
          {plannedStops.length >= 2 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => setOptimize((o) => !o)}
            >
              {optimize ? 'Show regular order' : 'Suggest better order'}
            </Button>
          )}
          {optionalStops.length > 0 && (
            <span className="text-muted-foreground flex items-center gap-1">
              <span className="inline-block size-2 rounded-full border border-dashed border-neutral-400" />
              optional hub
            </span>
          )}
        </span>
      </div>

      <div
        className={cn('w-full overflow-hidden rounded-lg border', mapClassName)}
      >
        <Map
          center={center}
          zoom={12}
          bounds={bounds ?? undefined}
          fitBoundsOptions={{ padding: 56, maxZoom: 15 }}
        >
          <MapControls showFullscreen />

          {route && route.geometry.length >= 2 && (
            <MapRoute
              coordinates={route.geometry}
              color={ROUTE_COLOR}
              width={4}
            />
          )}

          {/* Planned (core) hubs — numbered, status-coloured. */}
          {plannedStops.map((stop, i) => (
            <MapMarker
              key={stop.order}
              longitude={stop.targetLng}
              latitude={stop.targetLat}
            >
              <MarkerContent>
                <div
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow',
                    stop.isStart ? 'bg-indigo-600' : stopColor[stop.status],
                  )}
                >
                  {stop.isStart ? <Home className="size-3.5" /> : i + 1}
                </div>
              </MarkerContent>
              <MarkerLabel>{stop.name}</MarkerLabel>
              <MarkerPopup closeButton>
                <div className="space-y-1 text-xs">
                  <div className="text-sm font-medium">{stop.name}</div>
                  <div className="text-muted-foreground capitalize">
                    {stop.status === 'captured' ? 'visited' : 'not visited'}
                  </div>
                  {stop.odometer != null && (
                    <div>Odometer: {stop.odometer.toLocaleString()} km</div>
                  )}
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}

          {/* Optional (ad-hoc) hubs — faint; green when visited. */}
          {optionalStops.map((stop) => (
            <MapMarker
              key={stop.order}
              longitude={stop.targetLng}
              latitude={stop.targetLat}
            >
              <MarkerContent>
                <div
                  className={cn(
                    'flex size-4 items-center justify-center rounded-full border border-dashed border-white/70 shadow',
                    stop.status === 'captured'
                      ? 'bg-green-500'
                      : 'bg-neutral-500/60',
                  )}
                />
              </MarkerContent>
              <MarkerLabel>{stop.name} · optional</MarkerLabel>
              <MarkerPopup closeButton>
                <div className="space-y-1 text-xs">
                  <div className="text-sm font-medium">{stop.name}</div>
                  <div className="text-muted-foreground">
                    optional hub ·{' '}
                    {stop.status === 'captured' ? 'visited' : 'not visited'}
                  </div>
                  {stop.odometer != null && (
                    <div>Odometer: {stop.odometer.toLocaleString()} km</div>
                  )}
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}

          {vehicle && (
            <MapMarker longitude={vehicle.lng} latitude={vehicle.lat}>
              <MarkerContent>
                <div className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg">
                  <Truck className="size-4" />
                </div>
              </MarkerContent>
              <MarkerLabel position="bottom">{vehicleRegistration}</MarkerLabel>
              <MarkerPopup closeButton>
                <div className="space-y-1 text-xs">
                  <div className="text-sm font-medium">
                    {vehicleRegistration}
                  </div>
                  {vehicle.odometer != null && (
                    <div>Odometer: {vehicle.odometer.toLocaleString()} km</div>
                  )}
                  {vehicle.speed != null && (
                    <div>Speed: {Math.round(vehicle.speed)} km/h</div>
                  )}
                  <div className="text-muted-foreground">
                    As of {new Date(vehicle.capturedAt).toLocaleTimeString()}
                  </div>
                </div>
              </MarkerPopup>
            </MapMarker>
          )}
        </Map>
      </div>
    </div>
  )
}
