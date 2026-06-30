import { ConvexError, v } from 'convex/values'
import { mutation, query, MutationCtx } from './_generated/server'
import { getUser } from './auth'
import { Id } from './_generated/dataModel'

const stopInput = v.object({
  name: v.string(),
  lat: v.number(),
  lng: v.number(),
  radiusMeters: v.number(),
})

// All configured routes for the current user, each with its drop points.
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx)
    const routes = await ctx.db
      .query('routes')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect()

    return await Promise.all(
      routes.map(async (route) => {
        const stops = await ctx.db
          .query('routeStops')
          .withIndex('by_route', (q) => q.eq('routeId', route._id))
          .collect()
        stops.sort((a, b) => a.order - b.order)
        return { ...route, stops }
      }),
    )
  },
})

// A single route + drop points, scoped to the current user.
export const get = query({
  args: { id: v.id('routes') },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    const route = await ctx.db.get(args.id)
    if (!route || route.userId !== user._id) {
      throw new ConvexError('Route not found')
    }
    const stops = await ctx.db
      .query('routeStops')
      .withIndex('by_route', (q) => q.eq('routeId', route._id))
      .collect()
    stops.sort((a, b) => a.order - b.order)
    return { ...route, stops }
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    vehicleRegistration: v.string(),
    activeStartMinutes: v.number(),
    activeEndMinutes: v.number(),
    stops: v.array(stopInput),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    const routeId = await ctx.db.insert('routes', {
      userId: user._id,
      name: args.name.trim(),
      vehicleRegistration: args.vehicleRegistration.trim(),
      isActive: true,
      activeStartMinutes: args.activeStartMinutes,
      activeEndMinutes: args.activeEndMinutes,
    })
    await insertStops(ctx, routeId, args.stops)
    return routeId
  },
})

export const update = mutation({
  args: {
    id: v.id('routes'),
    name: v.string(),
    vehicleRegistration: v.string(),
    activeStartMinutes: v.number(),
    activeEndMinutes: v.number(),
    stops: v.array(stopInput),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    const route = await ctx.db.get(args.id)
    if (!route || route.userId !== user._id) {
      throw new ConvexError('Route not found')
    }
    await ctx.db.patch(args.id, {
      name: args.name.trim(),
      vehicleRegistration: args.vehicleRegistration.trim(),
      activeStartMinutes: args.activeStartMinutes,
      activeEndMinutes: args.activeEndMinutes,
    })
    // Replace drop points wholesale — simplest correct approach for an edit.
    await deleteStops(ctx, args.id)
    await insertStops(ctx, args.id, args.stops)
  },
})

export const setActive = mutation({
  args: { id: v.id('routes'), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    const route = await ctx.db.get(args.id)
    if (!route || route.userId !== user._id) {
      throw new ConvexError('Route not found')
    }
    await ctx.db.patch(args.id, { isActive: args.isActive })
  },
})

export const remove = mutation({
  args: { id: v.id('routes') },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    const route = await ctx.db.get(args.id)
    if (!route || route.userId !== user._id) {
      throw new ConvexError('Route not found')
    }
    await deleteStops(ctx, args.id)
    await ctx.db.delete(args.id)
  },
})

async function insertStops(
  ctx: MutationCtx,
  routeId: Id<'routes'>,
  stops: Array<{
    name: string
    lat: number
    lng: number
    radiusMeters: number
  }>,
) {
  await Promise.all(
    stops.map((stop, index) =>
      ctx.db.insert('routeStops', {
        routeId,
        order: index,
        name: stop.name.trim(),
        lat: stop.lat,
        lng: stop.lng,
        radiusMeters: stop.radiusMeters,
      }),
    ),
  )
}

async function deleteStops(ctx: MutationCtx, routeId: Id<'routes'>) {
  const stops = await ctx.db
    .query('routeStops')
    .withIndex('by_route', (q) => q.eq('routeId', routeId))
    .collect()
  await Promise.all(stops.map((s) => ctx.db.delete(s._id)))
}
