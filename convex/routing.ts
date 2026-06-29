import { v } from 'convex/values'
import { action } from './_generated/server'
import { api } from './_generated/api'
import { fetchOptimizedTrip } from './lib/osrm'

// Compute the optimal visiting order + driving geometry for a set of
// coordinates (index 0 is the fixed start, e.g. the vehicle). Auth-guarded.
export const getOptimizedRoute = action({
  args: {
    coordinates: v.array(v.object({ lat: v.number(), lng: v.number() })),
  },
  handler: async (ctx, args) => {
    await ctx.runQuery(api.auth.getCurrentUser, {})
    return await fetchOptimizedTrip(args.coordinates)
  },
})
