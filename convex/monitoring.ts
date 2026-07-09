import { v } from 'convex/values'
import {
  internalAction,
  internalMutation,
  MutationCtx,
} from './_generated/server'
import { internal } from './_generated/api'
import { Doc, Id } from './_generated/dataModel'
import { fetchVehicleReading } from './lib/iot'
import { haversineMeters } from './lib/geo'
import { isWithinActiveWindow, operationalDateString } from './lib/time'

const DEFAULT_RADIUS_M = 100
const EXIT_HYSTERESIS_M = 50 // must travel this far past the radius to count as "exited"

// Cron (every 2 min): poll the vehicle of every active route whose active-hours
// window is currently open. One IoT call per vehicle (respects 1 req/min/vehicle).
export const tick = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const date = operationalDateString(now)
    const routes = await ctx.db.query('routes').collect()

    const vehicles = new Set<string>()
    for (const route of routes) {
      if (
        route.isActive &&
        route.activeStartMinutes != null &&
        route.activeEndMinutes != null &&
        isWithinActiveWindow(
          now,
          route.activeStartMinutes,
          route.activeEndMinutes,
        )
      ) {
        const eff = await effectiveVehicle(ctx, route, date)
        if (eff) vehicles.add(eff)
      }
    }

    for (const vehicleRegistration of vehicles) {
      await ctx.scheduler.runAfter(0, internal.monitoring.pollVehicle, {
        vehicleRegistration,
      })
    }
    return { polled: vehicles.size }
  },
})

// One IoT call for a vehicle, then evaluate geofence entries/exits.
export const pollVehicle = internalAction({
  args: { vehicleRegistration: v.string() },
  handler: async (ctx, args) => {
    const reading = await fetchVehicleReading(
      args.vehicleRegistration,
      Date.now(),
    )
    if (!reading) return
    await ctx.runMutation(internal.monitoring.evaluateEntries, {
      vehicleRegistration: args.vehicleRegistration,
      lat: reading.lat,
      lng: reading.lng,
      odometer: reading.odometer,
      at: reading.capturedAt,
    })
  },
})

// Compare the reading against every drop point of the vehicle's open routes;
// log a visit on each outside->inside transition, close it on exit.
export const evaluateEntries = internalMutation({
  args: {
    vehicleRegistration: v.string(),
    lat: v.number(),
    lng: v.number(),
    odometer: v.optional(v.number()),
    at: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const date = operationalDateString(now)

    const candidateRoutes = (await ctx.db.query('routes').collect()).filter(
      (r) =>
        r.isActive &&
        r.activeStartMinutes != null &&
        r.activeEndMinutes != null &&
        isWithinActiveWindow(now, r.activeStartMinutes, r.activeEndMinutes),
    )

    for (const route of candidateRoutes) {
      // Only process routes whose effective vehicle today is the one we polled.
      const eff = await effectiveVehicle(ctx, route, date)
      if (eff !== args.vehicleRegistration) continue

      const stops = await ctx.db
        .query('routeStops')
        .withIndex('by_route', (q) => q.eq('routeId', route._id))
        .collect()

      for (const stop of stops) {
        const radius = stop.radiusMeters ?? DEFAULT_RADIUS_M
        const distance = haversineMeters(args.lat, args.lng, stop.lat, stop.lng)
        const state = await getOrInitState(ctx, route._id, stop._id, date)

        if (!state.insideNow && distance <= radius) {
          // ENTRY → open a new visit.
          const visitId = await ctx.db.insert('visits', {
            userId: route.userId,
            routeId: route._id,
            routeStopId: stop._id,
            vehicleRegistration: args.vehicleRegistration, // the vehicle actually polled
            date,
            odometer: args.odometer,
            lat: args.lat,
            lng: args.lng,
            distanceMeters: distance,
            enteredAt: args.at,
          })
          await ctx.db.patch(state._id, {
            insideNow: true,
            openVisitId: visitId,
            lastEntryAt: args.at,
            lastDistanceMeters: distance,
          })
        } else if (state.insideNow && distance > radius + EXIT_HYSTERESIS_M) {
          // EXIT → close the open visit (record dwell).
          if (state.openVisitId) {
            const visit = await ctx.db.get(state.openVisitId)
            if (visit) {
              await ctx.db.patch(visit._id, {
                exitedAt: args.at,
                dwellSeconds: Math.max(
                  0,
                  Math.round((args.at - visit.enteredAt) / 1000),
                ),
              })
            }
          }
          await ctx.db.patch(state._id, {
            insideNow: false,
            openVisitId: undefined,
            lastDistanceMeters: distance,
          })
        } else {
          await ctx.db.patch(state._id, { lastDistanceMeters: distance })
        }
      }
    }
  },
})

// Which vehicle should be polled for a route on `date`: the per-day override if
// it's trackable; null if the override is a non-trackable vendor (skip polling);
// otherwise the route's default vehicle.
async function effectiveVehicle(
  ctx: MutationCtx,
  route: Doc<'routes'>,
  date: string,
): Promise<string | null> {
  const ov = await ctx.db
    .query('routeDayOverrides')
    .withIndex('by_route_date', (q) =>
      q.eq('routeId', route._id).eq('date', date),
    )
    .first()
  if (!ov) return route.vehicleRegistration
  if (!ov.trackable) return null
  return ov.vehicleRegistration
}

// One monitorState row per drop point; reset its transition state on a new day.
async function getOrInitState(
  ctx: MutationCtx,
  routeId: Id<'routes'>,
  routeStopId: Id<'routeStops'>,
  date: string,
): Promise<Doc<'monitorState'>> {
  const existing = await ctx.db
    .query('monitorState')
    .withIndex('by_stop', (q) => q.eq('routeStopId', routeStopId))
    .first()

  if (existing) {
    if (existing.date !== date) {
      await ctx.db.patch(existing._id, {
        date,
        insideNow: false,
        openVisitId: undefined,
      })
      return (await ctx.db.get(existing._id))!
    }
    return existing
  }

  const id = await ctx.db.insert('monitorState', {
    routeId,
    routeStopId,
    date,
    insideNow: false,
  })
  return (await ctx.db.get(id))!
}
