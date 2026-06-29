import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

// The operational day starts at 5 PM IST, so generate that day's routes right
// as the window opens. 5 PM IST = 11:30 UTC.
crons.daily(
  'generate-daily-routes',
  { hourUTC: 11, minuteUTC: 30 },
  internal.generation.generateDaily,
)

// Poll the IoT API every 2 minutes for vehicles with an open drop-point window.
// The 2-minute cadence stays under the IoT 1 req/min/vehicle rate limit.
crons.interval('poll-vehicles', { minutes: 2 }, internal.polling.tick)

export default crons
