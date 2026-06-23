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

  // A route configured once by the user. Reused to generate a daily route each day.
  routes: defineTable({
    userId: v.id('users'),
    name: v.string(),
    vehicleRegistration: v.string(),
    isActive: v.boolean(),
  }).index('by_user', ['userId']),

  // Ordered drop points belonging to a configured route.
  routeStops: defineTable({
    routeId: v.id('routes'),
    order: v.number(),
    name: v.string(),
    lat: v.number(),
    lng: v.number(),
    // Minutes from midnight (IST), e.g. 17:00 -> 1020.
    expectedMinutes: v.number(),
  }).index('by_route', ['routeId']),

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
