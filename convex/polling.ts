import { v } from 'convex/values'
import {
  internalAction,
  internalMutation,
  MutationCtx,
} from './_generated/server'
import { internal } from './_generated/api'
import { Id } from './_generated/dataModel'
import { fetchVehicleReading } from './lib/iot'
import { GEOFENCE_METERS, haversineMeters } from './lib/geo'

// Runs every 2 minutes. Opens stops whose window has started, closes stops
// whose window has ended without a capture, and kicks off one IoT poll per
// vehicle that currently has an open stop (respecting the 1 req/min limit).
export const tick = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()

    const pending = await ctx.db
      .query('dailyStops')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .collect()
    const polling = await ctx.db
      .query('dailyStops')
      .withIndex('by_status', (q) => q.eq('status', 'polling'))
      .collect()

    const vehiclesToPoll = new Set<string>()

    for (const stop of pending) {
      if (now > stop.pollEndAt) {
        await ctx.db.patch(stop._id, { status: 'missed' })
        await updateDailyRouteStatus(ctx, stop.dailyRouteId)
      } else if (now >= stop.pollStartAt) {
        await ctx.db.patch(stop._id, { status: 'polling' })
        await ctx.db.patch(stop.dailyRouteId, { status: 'active' })
        vehiclesToPoll.add(stop.vehicleRegistration)
      }
    }

    for (const stop of polling) {
      if (now > stop.pollEndAt) {
        await ctx.db.patch(stop._id, { status: 'missed' })
        await updateDailyRouteStatus(ctx, stop.dailyRouteId)
      } else {
        vehiclesToPoll.add(stop.vehicleRegistration)
      }
    }

    for (const vehicleRegistration of vehiclesToPoll) {
      await ctx.scheduler.runAfter(0, internal.polling.pollVehicle, {
        vehicleRegistration,
      })
    }

    return { polled: vehiclesToPoll.size }
  },
})

// One IoT call for a vehicle, then hand the reading to `evaluate`.
export const pollVehicle = internalAction({
  args: { vehicleRegistration: v.string() },
  handler: async (ctx, args) => {
    const reading = await fetchVehicleReading(
      args.vehicleRegistration,
      Date.now(),
    )
    if (!reading) return

    await ctx.runMutation(internal.polling.evaluate, {
      vehicleRegistration: args.vehicleRegistration,
      lat: reading.lat,
      lng: reading.lng,
      odometer: reading.odometer,
      capturedAt: reading.capturedAt,
    })
  },
})

// Compare the reading against every open stop of this vehicle and capture any
// that fall inside the geofence.
export const evaluate = internalMutation({
  args: {
    vehicleRegistration: v.string(),
    lat: v.number(),
    lng: v.number(),
    odometer: v.optional(v.number()),
    capturedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const openStops = await ctx.db
      .query('dailyStops')
      .withIndex('by_status', (q) => q.eq('status', 'polling'))
      .collect()

    const affected = new Set<Id<'dailyRoutes'>>()

    for (const stop of openStops) {
      if (stop.vehicleRegistration !== args.vehicleRegistration) continue

      const distance = haversineMeters(
        args.lat,
        args.lng,
        stop.targetLat,
        stop.targetLng,
      )

      if (distance <= GEOFENCE_METERS) {
        await ctx.db.patch(stop._id, {
          status: 'captured',
          odometer: args.odometer,
          capturedLat: args.lat,
          capturedLng: args.lng,
          capturedAt: args.capturedAt,
          lastPolledAt: now,
          lastDistanceMeters: distance,
        })
        affected.add(stop.dailyRouteId)
      } else {
        await ctx.db.patch(stop._id, {
          lastPolledAt: now,
          lastDistanceMeters: distance,
        })
      }
    }

    for (const dailyRouteId of affected) {
      await updateDailyRouteStatus(ctx, dailyRouteId)
    }
  },
})

// Mark a daily route completed once none of its stops are still open.
async function updateDailyRouteStatus(
  ctx: MutationCtx,
  dailyRouteId: Id<'dailyRoutes'>,
) {
  const stops = await ctx.db
    .query('dailyStops')
    .withIndex('by_daily_route', (q) => q.eq('dailyRouteId', dailyRouteId))
    .collect()
  const anyOpen = stops.some(
    (s) => s.status === 'pending' || s.status === 'polling',
  )
  await ctx.db.patch(dailyRouteId, {
    status: anyOpen ? 'active' : 'completed',
  })
}
