// OSRM (Open Source Routing Machine) trip service. The public demo server works
// with no API key; override with OSRM_BASE_URL to point at a self-hosted server.
const DEFAULT_OSRM_BASE_URL = 'https://router.project-osrm.org'

type OsrmTripResponse = {
  code: string
  trips?: Array<{
    distance: number
    duration: number
    geometry: { coordinates: Array<[number, number]>; type: 'LineString' }
  }>
  waypoints?: Array<{ waypoint_index: number; trips_index: number }>
}

export type OptimizedRoute = {
  /** Road-following path as [lng, lat] pairs. */
  geometry: Array<[number, number]>
  /** Input coordinate indices in the optimal visiting order. */
  order: number[]
  distanceMeters: number
  durationSeconds: number
}

// Solve the optimal visiting order for `coordinates` (index 0 is the fixed
// start, e.g. the vehicle) and return the driving geometry. `roundtrip=false`
// so the vehicle does not have to return to its start.
export async function fetchOptimizedTrip(
  coordinates: Array<{ lat: number; lng: number }>,
): Promise<OptimizedRoute | null> {
  if (coordinates.length < 2) return null

  const base = process.env.OSRM_BASE_URL ?? DEFAULT_OSRM_BASE_URL
  const coordStr = coordinates.map((c) => `${c.lng},${c.lat}`).join(';')
  const url =
    `${base}/trip/v1/driving/${coordStr}` +
    `?source=first&roundtrip=false&geometries=geojson&overview=full`

  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    throw new Error(`OSRM error ${res.status}`)
  }

  const body = (await res.json()) as OsrmTripResponse
  const trip = body.trips?.[0]
  if (body.code !== 'Ok' || !trip || !body.waypoints) {
    return null
  }

  // waypoints are returned in input order; waypoint_index is each one's
  // position within the optimized trip. Sort input indices by that.
  const order = body.waypoints
    .map((w, inputIndex) => ({ inputIndex, tripIndex: w.waypoint_index }))
    .sort((a, b) => a.tripIndex - b.tripIndex)
    .map((x) => x.inputIndex)

  return {
    geometry: trip.geometry.coordinates,
    order,
    distanceMeters: trip.distance,
    durationSeconds: trip.duration,
  }
}
