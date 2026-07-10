import { v } from 'convex/values'
import { action } from './_generated/server'
import { api } from './_generated/api'
import { fetchOptimizedTrip, fetchRoute } from './lib/osrm'

const coordsArg = v.array(v.object({ lat: v.number(), lng: v.number() }))

// The regular route: drive through the coordinates in the GIVEN order (the
// route the vehicle follows most days). No reordering. Auth-guarded.
export const getPlannedRoute = action({
  args: { coordinates: coordsArg },
  handler: async (ctx, args) => {
    await ctx.runQuery(api.auth.getCurrentUser, {})
    return await fetchRoute(args.coordinates)
  },
})

// Suggest a better order (TSP) over the given coordinates + driving geometry
// (index 0 is the fixed start, e.g. the vehicle). Auth-guarded.
export const getOptimizedRoute = action({
  args: { coordinates: coordsArg },
  handler: async (ctx, args) => {
    await ctx.runQuery(api.auth.getCurrentUser, {})
    return await fetchOptimizedTrip(args.coordinates)
  },
})
