import { internalMutation, MutationCtx } from './_generated/server'
import { Doc } from './_generated/dataModel'
import { expectedAtMs, istDateString, POLL_WINDOW_MS } from './lib/time'

// Materialize one configured route into a daily route + stops for `date`.
// Idempotent: returns false if the route already has a daily route for that day.
export async function materializeRouteForDay(
  ctx: MutationCtx,
  route: Doc<'routes'>,
  date: string,
): Promise<boolean> {
  const existing = await ctx.db
    .query('dailyRoutes')
    .withIndex('by_route_date', (q) =>
      q.eq('routeId', route._id).eq('date', date),
    )
    .first()
  if (existing) return false

  const stops = await ctx.db
    .query('routeStops')
    .withIndex('by_route', (q) => q.eq('routeId', route._id))
    .collect()
  stops.sort((a, b) => a.order - b.order)

  const dailyRouteId = await ctx.db.insert('dailyRoutes', {
    routeId: route._id,
    userId: route.userId,
    date,
    vehicleRegistration: route.vehicleRegistration,
    routeName: route.name,
    status: 'pending',
  })

  await Promise.all(
    stops.map((stop) => {
      const expectedAt = expectedAtMs(date, stop.expectedMinutes)
      return ctx.db.insert('dailyStops', {
        dailyRouteId,
        routeId: route._id,
        userId: route.userId,
        vehicleRegistration: route.vehicleRegistration,
        order: stop.order,
        name: stop.name,
        targetLat: stop.lat,
        targetLng: stop.lng,
        expectedMinutes: stop.expectedMinutes,
        expectedAt,
        pollStartAt: expectedAt - POLL_WINDOW_MS,
        pollEndAt: expectedAt + POLL_WINDOW_MS,
        status: 'pending',
      })
    }),
  )
  return true
}

// Cron entrypoint: generate today's daily routes for every active route
// across all users. Runs at 00:00 IST.
export const generateDaily = internalMutation({
  args: {},
  handler: async (ctx) => {
    const date = istDateString(Date.now())
    const routes = await ctx.db.query('routes').collect()
    let created = 0
    for (const route of routes) {
      if (!route.isActive) continue
      if (await materializeRouteForDay(ctx, route, date)) created++
    }
    return { date, created }
  },
})
