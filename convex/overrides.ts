import { ConvexError, v } from 'convex/values'
import { mutation } from './_generated/server'
import { getUser } from './auth'

// Set (or update) the per-day vehicle override for a route. Whole-day model:
// the override replaces the day, so we clear that route's visits for the date
// and reset its geofence state so the effective vehicle re-captures cleanly.
export const set = mutation({
  args: {
    routeId: v.id('routes'),
    date: v.string(),
    vehicleRegistration: v.string(),
    trackable: v.boolean(),
    vendorName: v.optional(v.string()),
    vendorCost: v.optional(v.number()),
    manualKm: v.optional(v.number()),
    reason: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    const route = await ctx.db.get(args.routeId)
    if (!route || route.userId !== user._id) {
      throw new ConvexError('Route not found')
    }

    const source: 'own_substitute' | 'third_party' = args.trackable
      ? 'own_substitute'
      : 'third_party'

    const fields = {
      routeId: args.routeId,
      userId: user._id,
      date: args.date,
      vehicleRegistration: args.vehicleRegistration.trim(),
      source,
      trackable: args.trackable,
      vendorName: args.vendorName?.trim() || undefined,
      vendorCost: args.vendorCost,
      manualKm: args.manualKm,
      reason: args.reason?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
    }

    const existing = await ctx.db
      .query('routeDayOverrides')
      .withIndex('by_route_date', (q) =>
        q.eq('routeId', args.routeId).eq('date', args.date),
      )
      .first()
    if (existing) {
      await ctx.db.patch(existing._id, fields)
    } else {
      await ctx.db.insert('routeDayOverrides', fields)
    }

    // Whole-day override: discard the day's existing visits (they may be from the
    // wrong/old vehicle) so km recomputes cleanly for the effective vehicle.
    const visits = await ctx.db
      .query('visits')
      .withIndex('by_route_date', (q) =>
        q.eq('routeId', args.routeId).eq('date', args.date),
      )
      .collect()
    await Promise.all(visits.map((visit) => ctx.db.delete(visit._id)))

    // Re-arm the geofence state for this route's stops so the effective vehicle
    // can log fresh entries.
    const stops = await ctx.db
      .query('routeStops')
      .withIndex('by_route', (q) => q.eq('routeId', args.routeId))
      .collect()
    await Promise.all(
      stops.map(async (stop) => {
        const st = await ctx.db
          .query('monitorState')
          .withIndex('by_stop', (q) => q.eq('routeStopId', stop._id))
          .first()
        if (st) {
          await ctx.db.patch(st._id, {
            date: args.date,
            insideNow: false,
            openVisitId: undefined,
          })
        }
      }),
    )
  },
})

// Remove the override for a route+date (revert to the route's default vehicle).
export const clear = mutation({
  args: { routeId: v.id('routes'), date: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    const route = await ctx.db.get(args.routeId)
    if (!route || route.userId !== user._id) {
      throw new ConvexError('Route not found')
    }
    const existing = await ctx.db
      .query('routeDayOverrides')
      .withIndex('by_route_date', (q) =>
        q.eq('routeId', args.routeId).eq('date', args.date),
      )
      .first()
    if (existing) await ctx.db.delete(existing._id)
  },
})
