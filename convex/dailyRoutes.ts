import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getUser } from './auth'
import { istDateString } from './lib/time'
import { materializeRouteForDay } from './generation'

// Today's daily routes for the current user, each joined with its ordered stops.
export const today = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx)
    const date = istDateString(Date.now())

    const dailyRoutes = await ctx.db
      .query('dailyRoutes')
      .withIndex('by_user_date', (q) =>
        q.eq('userId', user._id).eq('date', date),
      )
      .collect()

    const withStops = await Promise.all(
      dailyRoutes.map(async (dr) => {
        const stops = await ctx.db
          .query('dailyStops')
          .withIndex('by_daily_route', (q) => q.eq('dailyRouteId', dr._id))
          .collect()
        stops.sort((a, b) => a.order - b.order)
        return { ...dr, stops }
      }),
    )

    return { date, dailyRoutes: withStops }
  },
})

// Materialize today's daily routes from the user's active configured routes.
// Idempotent: skips routes already generated for today.
export const generateToday = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx)
    const date = istDateString(Date.now())

    const routes = await ctx.db
      .query('routes')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()

    let created = 0
    for (const route of routes) {
      if (!route.isActive) continue
      if (await materializeRouteForDay(ctx, route, date)) created++
    }

    return { date, created }
  },
})

// Manually set the route-level odometer (placeholder until IoT capture lands).
export const setRouteOdometer = mutation({
  args: { id: v.id('dailyRoutes'), odometer: v.number() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    const dr = await ctx.db.get(args.id)
    if (!dr || dr.userId !== user._id) {
      throw new ConvexError('Daily route not found')
    }
    await ctx.db.patch(args.id, { odometer: args.odometer })
  },
})

// Manually capture a drop point's odometer reading and mark it captured.
export const setStopOdometer = mutation({
  args: { id: v.id('dailyStops'), odometer: v.number() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    const stop = await ctx.db.get(args.id)
    if (!stop || stop.userId !== user._id) {
      throw new ConvexError('Stop not found')
    }
    await ctx.db.patch(args.id, {
      odometer: args.odometer,
      status: 'captured',
      capturedAt: Date.now(),
    })

    // Mark the parent daily route completed once every stop is terminal.
    const siblings = await ctx.db
      .query('dailyStops')
      .withIndex('by_daily_route', (q) =>
        q.eq('dailyRouteId', stop.dailyRouteId),
      )
      .collect()
    const allDone = siblings.every((s) => s.status !== 'pending')
    await ctx.db.patch(stop.dailyRouteId, {
      status: allDone ? 'completed' : 'active',
    })
  },
})
