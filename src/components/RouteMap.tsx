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

type Optimized = {
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

const PLANNED_COLOR = '#6366f1' // indigo dashed = configured order
const OPTIMIZED_COLOR = '#10b981' // emerald solid = OSRM optimized route

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
  const getOptimized = useAction(api.routing.getOptimizedRoute)

  const [vehicle, setVehicle] = useState<VehiclePosition | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [optimized, setOptimized] = useState<Optimized | null>(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState<string | null>(null)

  const sorted = useMemo(
    () => [...stops].sort((a, b) => a.order - b.order),
    [stops],
  )

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const reading = await getPosition({ vehicleRegistration })
      if (reading) {
        setVehicle(reading)
      } else {
        setError('No live location available for this vehicle')
      }
    } catch (err) {
      console.error(err)
      setError('Could not fetch vehicle location')
    } finally {
      setLoading(false)
    }
  }

  // Fetch the vehicle's current position when the map opens.
  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleRegistration])

  // Ordered routing inputs: the vehicle (if known) is the fixed start, then the
  // configured drop points. Index in this array maps to OSRM's input index.
  const routeInputs = useMemo(() => {
    const inputs: Array<{
      kind: 'vehicle' | 'stop'
      stopIndex: number
      lat: number
      lng: number
    }> = []
    if (vehicle) {
      inputs.push({
        kind: 'vehicle',
        stopIndex: -1,
        lat: vehicle.lat,
        lng: vehicle.lng,
      })
    }
    sorted.forEach((s, idx) =>
      inputs.push({
        kind: 'stop',
        stopIndex: idx,
        lat: s.targetLat,
        lng: s.targetLng,
      }),
    )
    return inputs
  }, [vehicle, sorted])

  const inputsKey = useMemo(
    () =>
      routeInputs
        .map((p) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`)
        .join(';'),
    [routeInputs],
  )

  // Recompute the optimized route whenever the inputs change.
  useEffect(() => {
    if (routeInputs.length < 2) {
      setOptimized(null)
      return
    }
    let cancelled = false
    setRouteLoading(true)
    setRouteError(null)
    getOptimized({
      coordinates: routeInputs.map(({ lat, lng }) => ({ lat, lng })),
    })
      .then((r) => {
        if (cancelled) return
        if (r) setOptimized(r)
        else setRouteError('No optimized route found')
      })
      .catch((err) => {
        if (cancelled) return
        console.error(err)
        setRouteError('Could not compute optimized route')
      })
      .finally(() => {
        if (!cancelled) setRouteLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputsKey])

  const points = useMemo(
    () => routeInputs.map((p) => [p.lng, p.lat] as [number, number]),
    [routeInputs],
  )
  const bounds = useMemo(() => computeBounds(points), [points])
  const center: [number, number] = bounds
    ? [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2]
    : [77.209, 28.6139] // sensible India default

  // Straight connector through the configured drop-point order (reference).
  const plannedLine = useMemo(
    () => sorted.map((s) => [s.targetLng, s.targetLat] as [number, number]),
    [sorted],
  )

  // Drop points listed in the OSRM-optimized visiting order.
  const optimizedStops = useMemo(() => {
    if (!optimized) return []
    return optimized.order
      .map((i) => routeInputs[i])
      .filter((p) => p && p.kind === 'stop')
      .map((p) => sorted[p.stopIndex])
      .filter(Boolean)
  }, [optimized, routeInputs, sorted])

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

      {/* Optimized route summary + legend */}
      <div className="bg-muted/40 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border px-3 py-2 text-xs">
        <span className="flex items-center gap-1.5 font-medium">
          <RouteIcon className="size-3.5" /> Optimized route
        </span>
        {routeLoading ? (
          <span className="text-muted-foreground flex items-center gap-1">
            <Loader2 className="size-3 animate-spin" /> computing…
          </span>
        ) : optimized ? (
          <>
            <span>{(optimized.distanceMeters / 1000).toFixed(1)} km</span>
            <span>~{Math.round(optimized.durationSeconds / 60)} min</span>
            {optimizedStops.length > 0 && (
              <span className="text-muted-foreground">
                Order: {optimizedStops.map((s) => s.name).join(' → ')}
              </span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground">
            {routeError ?? 'unavailable'}
          </span>
        )}
        <span className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-0.5 w-4"
              style={{ backgroundColor: OPTIMIZED_COLOR }}
            />
            optimized
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-0.5 w-4 border-t border-dashed"
              style={{ borderColor: PLANNED_COLOR }}
            />
            planned
          </span>
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

          {/* Planned (configured) order — straight dashed reference line. */}
          {plannedLine.length >= 2 && (
            <MapRoute
              coordinates={plannedLine}
              color={PLANNED_COLOR}
              width={2}
              opacity={0.5}
              dashArray={[2, 2]}
            />
          )}

          {/* OSRM optimized route — solid road-following path. */}
          {optimized && optimized.geometry.length >= 2 && (
            <MapRoute
              coordinates={optimized.geometry}
              color={OPTIMIZED_COLOR}
              width={4}
            />
          )}

          {sorted.map((stop) => (
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
                  {stop.isStart ? (
                    <Home className="size-3.5" />
                  ) : (
                    stop.order + 1
                  )}
                </div>
              </MarkerContent>
              <MarkerLabel>
                {stop.isStart ? `${stop.name} (start)` : stop.name}
              </MarkerLabel>
              <MarkerPopup closeButton>
                <div className="space-y-1 text-xs">
                  <div className="text-sm font-medium">
                    {stop.name}
                    {stop.isStart && ' (start)'}
                  </div>
                  <div className="text-muted-foreground capitalize">
                    {stop.status}
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
