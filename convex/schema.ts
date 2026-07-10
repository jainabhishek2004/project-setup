import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  users: defineTable({
    email: v.string(),
    authId: v.optional(v.string()),
  }).index('email', ['email']),

  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
    userId: v.id('users'),
  }).index('userId', ['userId']),

  // A route configured once by the user. The vehicle is monitored continuously
  // during the active-hours window; every geofence entry becomes a visit.
  routes: defineTable({
    userId: v.id('users'),
    name: v.string(),
    vehicleRegistration: v.string(),
    isActive: v.boolean(),
    // Active-hours window (minutes from midnight, IST) — when to monitor the
    // vehicle. e.g. 17:00 -> 1020. Optional for routes created before this.
    activeStartMinutes: v.optional(v.number()),
    activeEndMinutes: v.optional(v.number()),
    // --- legacy fields (no longer used by the visit-tracking model) ---
    startName: v.optional(v.string()),
    startLat: v.optional(v.number()),
    startLng: v.optional(v.number()),
    startExpectedMinutes: v.optional(v.number()),
  }).index('by_user', ['userId']),

  // Drop points (geofences) belonging to a route.
  routeStops: defineTable({
    routeId: v.id('routes'),
    order: v.number(),
    name: v.string(),
    lat: v.number(),
    lng: v.number(),
    // Geofence radius in metres (default 100 when unset).
    radiusMeters: v.optional(v.number()),
    // optional = ad-hoc hub (visited some days). Excluded from the regular
    // optimized route line; still geofenced/captured when visited. Unset =
    // planned (core, part of the everyday route).
    optional: v.optional(v.boolean()),
    // legacy — was the scheduled expected time; unused by visit tracking.
    expectedMinutes: v.optional(v.number()),
  }).index('by_route', ['routeId']),

  // One row per geofence entry: the vehicle visited this drop point.
  visits: defineTable({
    userId: v.id('users'),
    routeId: v.id('routes'),
    routeStopId: v.id('routeStops'),
    vehicleRegistration: v.string(),
    date: v.string(), // operational "YYYY-MM-DD" (IST) the visit belongs to
    odometer: v.optional(v.number()),
    lat: v.number(),
    lng: v.number(),
    distanceMeters: v.number(),
    enteredAt: v.number(),
    exitedAt: v.optional(v.number()),
    dwellSeconds: v.optional(v.number()),
  })
    .index('by_route_date', ['routeId', 'date'])
    .index('by_user_date', ['userId', 'date'])
    .index('by_stop_date', ['routeStopId', 'date']),

  // Inside/outside tracking per drop point so the monitor can detect the
  // outside->inside transition that starts a new visit. Reset each day.
  monitorState: defineTable({
    routeId: v.id('routes'),
    routeStopId: v.id('routeStops'),
    date: v.string(),
    insideNow: v.boolean(),
    openVisitId: v.optional(v.id('visits')),
    lastEntryAt: v.optional(v.number()),
    lastDistanceMeters: v.optional(v.number()),
  }).index('by_stop', ['routeStopId']),

  // Per-day vehicle override: which vehicle actually ran a route on a given day
  // (breakdown substitute or a third-party/Porter vehicle). Whole-day model.
  routeDayOverrides: defineTable({
    routeId: v.id('routes'),
    userId: v.id('users'),
    date: v.string(), // operational "YYYY-MM-DD" (IST)
    vehicleRegistration: v.string(), // the actual vehicle that ran
    source: v.union(
      v.literal('own_substitute'), // another own vehicle (has IoT → auto capture)
      v.literal('third_party'), // vendor e.g. Porter (no IoT → manual)
    ),
    trackable: v.boolean(), // true = poll IoT; false = manual
    vendorName: v.optional(v.string()),
    vendorCost: v.optional(v.number()), // what we paid the vendor that day
    manualKm: v.optional(v.number()), // km entered manually for non-trackable days
    reason: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index('by_route_date', ['routeId', 'date'])
    .index('by_user_date', ['userId', 'date']),

  // One materialized execution of a route for a given day.
  dailyRoutes: defineTable({
    routeId: v.id('routes'),
    userId: v.id('users'),
    date: v.string(), // "YYYY-MM-DD" in IST
    vehicleRegistration: v.string(),
    routeName: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('active'),
      v.literal('completed'),
    ),
    // Route-level odometer reading (e.g. start of day) — manual for now.
    odometer: v.optional(v.number()),
  })
    .index('by_user_date', ['userId', 'date'])
    .index('by_route_date', ['routeId', 'date']),

  // Per-drop-point execution state for a daily route.
  dailyStops: defineTable({
    dailyRouteId: v.id('dailyRoutes'),
    routeId: v.id('routes'),
    userId: v.id('users'),
    // Denormalized from the daily route so the polling cron can group by vehicle.
    vehicleRegistration: v.string(),
    // The route's start/origin point sorts first (order -1) and is rendered
    // distinctly; everything else (polling, geofence capture) is identical.
    isStart: v.optional(v.boolean()),
    order: v.number(),
    name: v.string(),
    targetLat: v.number(),
    targetLng: v.number(),
    expectedMinutes: v.number(),
    // Absolute epoch-ms window for IoT polling (computed at generation time).
    expectedAt: v.number(),
    pollStartAt: v.number(), // expectedAt - 30 min
    pollEndAt: v.number(), // expectedAt + 30 min
    status: v.union(
      v.literal('pending'),
      v.literal('polling'),
      v.literal('captured'),
      v.literal('missed'),
    ),
    // Captured at arrival (IoT-driven; can also be set manually).
    odometer: v.optional(v.number()),
    capturedLat: v.optional(v.number()),
    capturedLng: v.optional(v.number()),
    capturedAt: v.optional(v.number()),
    // Last IoT poll diagnostics.
    lastPolledAt: v.optional(v.number()),
    lastDistanceMeters: v.optional(v.number()),
  })
    .index('by_daily_route', ['dailyRouteId'])
    .index('by_status', ['status']),
})
