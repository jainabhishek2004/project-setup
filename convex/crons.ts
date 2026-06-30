import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

// Continuously monitor vehicles whose route active-hours window is open, and
// log a visit on each drop-point geofence entry. 2-min cadence stays under the
// IoT 1 req/min/vehicle rate limit.
crons.interval('monitor-vehicles', { minutes: 2 }, internal.monitoring.tick)

export default crons
