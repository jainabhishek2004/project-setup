import { ConvexError, v } from 'convex/values'
import { query } from './_generated/server'
import { getUser } from './auth'
import { operationalDateString } from './lib/time'

// Dashboard: each of the user's routes with the given day's visits grouped by
// drop point, plus billable km = (last - first odometer of that day's visits).
export const dashboard = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    const date = args.date ?? operationalDateString(Date.now())

    const routes = await ctx.db
      .query('routes')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect()

    const result = await Promise.all(
      routes.map(async (route) => {
        const stops = await ctx.db
          .query('routeStops')
          .withIndex('by_route', (q) => q.eq('routeId', route._id))
          .collect()
        stops.sort((a, b) => a.order - b.order)

        const visits = await ctx.db
          .query('visits')
          .withIndex('by_route_date', (q) =>
            q.eq('routeId', route._id).eq('date', date),
          )
          .collect()
        visits.sort((a, b) => a.enteredAt - b.enteredAt)

        const byStop = new Map<string, typeof visits>()
        for (const visit of visits) {
          const key = visit.routeStopId as string
          const arr = byStop.get(key) ?? []
          arr.push(visit)
          byStop.set(key, arr)
        }

        // Per-day vehicle override (breakdown substitute / third-party vendor).
        const override = await ctx.db
          .query('routeDayOverrides')
          .withIndex('by_route_date', (q) =>
            q.eq('routeId', route._id).eq('date', date),
          )
          .first()

        const odometers = visits
          .map((v) => v.odometer)
          .filter((o): o is number => o != null)
        const autoKm =
          odometers.length >= 2
            ? Math.max(0, Math.max(...odometers) - Math.min(...odometers))
            : null

        // Non-trackable (vendor) days have no odometer visits → use manual km.
        const billableKm =
          override && !override.trackable ? (override.manualKm ?? null) : autoKm

        return {
          ...route,
          // The vehicle that actually ran this day.
          effectiveVehicle:
            override?.vehicleRegistration ?? route.vehicleRegistration,
          override: override
            ? {
                vehicleRegistration: override.vehicleRegistration,
                source: override.source,
                trackable: override.trackable,
                vendorName: override.vendorName,
                vendorCost: override.vendorCost,
                manualKm: override.manualKm,
                reason: override.reason,
                notes: override.notes,
              }
            : null,
          stops: stops.map((s) => ({
            ...s,
            visits: byStop.get(s._id as string) ?? [],
          })),
          totalVisits: visits.length,
          billableKm,
        }
      }),
    )

    return { date, routes: result }
  },
})

// Visits for one route on a date (for the map page).
export const byRouteDate = query({
  args: { routeId: v.id('routes'), date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    const route = await ctx.db.get(args.routeId)
    if (!route || route.userId !== user._id) {
      throw new ConvexError('Route not found')
    }
    const date = args.date ?? operationalDateString(Date.now())
    const visits = await ctx.db
      .query('visits')
      .withIndex('by_route_date', (q) =>
        q.eq('routeId', args.routeId).eq('date', date),
      )
      .collect()
    visits.sort((a, b) => a.enteredAt - b.enteredAt)
    return { date, visits }
  },
})
