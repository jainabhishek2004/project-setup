import { ConvexError, v } from 'convex/values'
import { mutation, query, MutationCtx } from './_generated/server'
import { getUser } from './auth'
import { Id } from './_generated/dataModel'

const stopInput = v.object({
  name: v.string(),
  lat: v.number(),
  lng: v.number(),
  radiusMeters: v.number(),
  optional: v.optional(v.boolean()),
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

    // Reconcile drop points BY POSITION so existing hub ids are preserved. This
    // keeps already-captured visits attached to their hub (a full delete +
    // re-insert would give new ids and orphan those visits).
    const existing = await ctx.db
      .query('routeStops')
      .withIndex('by_route', (q) => q.eq('routeId', args.id))
      .collect()
    existing.sort((a, b) => a.order - b.order)

    for (let i = 0; i < args.stops.length; i++) {
      const s = args.stops[i]
      const fields = {
        routeId: args.id,
        order: i,
        name: s.name.trim(),
        lat: s.lat,
        lng: s.lng,
        radiusMeters: s.radiusMeters,
        optional: s.optional ? true : undefined,
      }
      if (existing[i]) {
        await ctx.db.patch(existing[i]._id, fields)
      } else {
        await ctx.db.insert('routeStops', fields)
      }
    }
    // Delete any hubs removed by the edit.
    for (let j = args.stops.length; j < existing.length; j++) {
      await ctx.db.delete(existing[j]._id)
    }
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
    optional?: boolean
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
        optional: stop.optional ? true : undefined,
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
