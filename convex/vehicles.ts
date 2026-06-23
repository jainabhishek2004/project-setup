import { v } from 'convex/values'
import { action } from './_generated/server'
import { api } from './_generated/api'
import { fetchVehicleReading } from './lib/iot'

// On-demand fetch of a vehicle's current position from the IoT API, used by the
// route map. Auth-guarded so only signed-in users can trigger the external call.
export const getCurrentPosition = action({
  args: { vehicleRegistration: v.string() },
  handler: async (ctx, args) => {
    // Throws if unauthenticated.
    await ctx.runQuery(api.auth.getCurrentUser, {})
    return await fetchVehicleReading(args.vehicleRegistration, Date.now())
  },
})
