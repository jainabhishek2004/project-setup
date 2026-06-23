import { useEffect, useMemo, useState } from 'react'
import { useAction } from 'convex/react'
import { Loader2, RefreshCw, Truck } from 'lucide-react'

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

const stopColor: Record<Stop['status'], string> = {
  pending: 'bg-neutral-400',
  polling: 'bg-amber-500',
  captured: 'bg-green-500',
  missed: 'bg-red-500',
}

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
}: {
  vehicleRegistration: string
  stops: Stop[]
}) {
  const getPosition = useAction(api.vehicles.getCurrentPosition)
  const [vehicle, setVehicle] = useState<VehiclePosition | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const points = useMemo(() => {
    const pts: Array<[number, number]> = sorted.map((s) => [
      s.targetLng,
      s.targetLat,
    ])
    if (vehicle) pts.push([vehicle.lng, vehicle.lat])
    return pts
  }, [sorted, vehicle])

  const bounds = useMemo(() => computeBounds(points), [points])
  const center: [number, number] = bounds
    ? [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2]
    : [77.209, 28.6139] // sensible India default

  const line = useMemo(
    () => sorted.map((s) => [s.targetLng, s.targetLat] as [number, number]),
    [sorted],
  )

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

      <div className="h-[60vh] max-h-[480px] w-full overflow-hidden rounded-lg border">
        <Map
          center={center}
          zoom={12}
          bounds={bounds ?? undefined}
          fitBoundsOptions={{ padding: 56, maxZoom: 15 }}
        >
          <MapControls showFullscreen />

          {line.length >= 2 && (
            <MapRoute coordinates={line} color="#6366f1" dashArray={[2, 2]} />
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
                    stopColor[stop.status],
                  )}
                >
                  {stop.order + 1}
                </div>
              </MarkerContent>
              <MarkerLabel>{stop.name}</MarkerLabel>
              <MarkerPopup closeButton>
                <div className="space-y-1 text-xs">
                  <div className="text-sm font-medium">{stop.name}</div>
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
