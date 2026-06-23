// Geofence radius (metres) within which a vehicle counts as "arrived".
export const GEOFENCE_METERS = 100

const EARTH_RADIUS_M = 6_371_000

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

// Great-circle distance between two coordinates, in metres.
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// The IoT `location` field is a "a, b" string. Its doc labels it
// "latitude, longitude", but the example (72.1234, 23.4567) is actually
// longitude-first for India. We disambiguate by magnitude using India's
// bounds (lat 6-38, lng 68-98): the value that can only be a longitude is
// treated as such. Falls back to the documented lat,lng order if ambiguous.
export function parseLocation(
  location: string,
): { lat: number; lng: number } | null {
  const parts = location.split(',').map((p) => Number(p.trim()))
  if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) {
    return null
  }
  const [a, b] = parts

  const looksLikeLat = (n: number) => Math.abs(n) <= 38
  const looksLikeLng = (n: number) => Math.abs(n) > 38 && Math.abs(n) <= 180

  // a=lat, b=lng (documented order) is consistent.
  if (looksLikeLat(a) && looksLikeLng(b)) {
    return { lat: a, lng: b }
  }
  // a=lng, b=lat (the example's actual order).
  if (looksLikeLng(a) && looksLikeLat(b)) {
    return { lat: b, lng: a }
  }
  // Ambiguous (both plausible as latitude) — trust the documented order.
  return { lat: a, lng: b }
}
