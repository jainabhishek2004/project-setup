import { parseLocation } from './geo'

const IOT_BASE_URL = 'https://financer.eulerlogistics.com/api/v2/vehicle-data'

// Subset of the VehicleLongItem response we care about.
type VehicleLongItem = {
  registration_number?: string
  location?: string
  odometer?: number
  event_timestamp?: string
  location_last_updated_at?: string
  speed?: number
}

export type VehicleReading = {
  registrationNumber?: string
  lat: number
  lng: number
  odometer?: number
  speed?: number
  capturedAt: number // epoch ms
}

// API timestamps are UTC without a zone suffix, e.g. "2023-04-22T12:00:00".
function parseUtc(ts: string | undefined): number | null {
  if (!ts) return null
  const withZone = /[zZ]|[+-]\d\d:?\d\d$/.test(ts) ? ts : `${ts}Z`
  const ms = Date.parse(withZone)
  return Number.isNaN(ms) ? null : ms
}

// Fetch the latest reading for a vehicle. Returns null when the vehicle has no
// usable location. `nowMs` is supplied by the caller for the capturedAt fallback.
export async function fetchVehicleReading(
  registrationNumber: string,
  nowMs: number,
): Promise<VehicleReading | null> {
  const apiKey = process.env.IOT_API_KEY
  if (!apiKey) {
    throw new Error('IOT_API_KEY environment variable is not set')
  }

  const url = `${IOT_BASE_URL}?registration_number=${encodeURIComponent(registrationNumber)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'X-Api-Key': apiKey, Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`IoT API error ${res.status} for ${registrationNumber}`)
  }

  const body = (await res.json()) as VehicleLongItem[]
  const item = Array.isArray(body)
    ? (body.find((v) => v.registration_number === registrationNumber) ??
      body[0])
    : undefined
  if (!item || !item.location) {
    return null
  }

  const coords = parseLocation(item.location)
  if (!coords) {
    return null
  }

  return {
    registrationNumber: item.registration_number,
    lat: coords.lat,
    lng: coords.lng,
    odometer: item.odometer,
    speed: item.speed,
    capturedAt:
      parseUtc(item.location_last_updated_at) ??
      parseUtc(item.event_timestamp) ??
      nowMs,
  }
}
