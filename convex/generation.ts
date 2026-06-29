import { internalMutation, MutationCtx } from './_generated/server'
import { Doc } from './_generated/dataModel'
import { expectedAtMs, operationalDateString, POLL_WINDOW_MS } from './lib/time'

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

  const inserts: Array<Promise<unknown>> = []

  // Start/origin point — captured via the same geofence machinery as drops.
  // order -1 sorts it ahead of the drop points (which start at 0).
  if (
    route.startLat != null &&
    route.startLng != null &&
    route.startExpectedMinutes != null
  ) {
    const expectedAt = expectedAtMs(date, route.startExpectedMinutes)
    inserts.push(
      ctx.db.insert('dailyStops', {
        dailyRouteId,
        routeId: route._id,
        userId: route.userId,
        vehicleRegistration: route.vehicleRegistration,
        isStart: true,
        order: -1,
        name: route.startName ?? 'Start',
        targetLat: route.startLat,
        targetLng: route.startLng,
        expectedMinutes: route.startExpectedMinutes,
        expectedAt,
        pollStartAt: expectedAt - POLL_WINDOW_MS,
        pollEndAt: expectedAt + POLL_WINDOW_MS,
        status: 'pending',
      }),
    )
  }

  for (const stop of stops) {
    const expectedAt = expectedAtMs(date, stop.expectedMinutes)
    inserts.push(
      ctx.db.insert('dailyStops', {
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
      }),
    )
  }

  await Promise.all(inserts)
  return true
}

// Cron entrypoint: generate the current operational day's routes for every
// active route across all users. Scheduled at 17:00 IST (window start), so
// operationalDateString resolves to the day whose window is just opening.
export const generateDaily = internalMutation({
  args: {},
  handler: async (ctx) => {
    const date = operationalDateString(Date.now())
    const routes = await ctx.db.query('routes').collect()
    let created = 0
    for (const route of routes) {
      if (!route.isActive) continue
      if (await materializeRouteForDay(ctx, route, date)) created++
    }
    return { date, created }
  },
})
