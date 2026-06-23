import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

// Generate today's daily routes for all active routes at 00:00 IST.
// IST = UTC+5:30, so that is 18:30 UTC the previous day.
crons.daily(
  'generate-daily-routes',
  { hourUTC: 18, minuteUTC: 30 },
  internal.generation.generateDaily,
)

// Poll the IoT API every 2 minutes for vehicles with an open drop-point window.
// The 2-minute cadence stays under the IoT 1 req/min/vehicle rate limit.
crons.interval('poll-vehicles', { minutes: 2 }, internal.polling.tick)

export default crons
