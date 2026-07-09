# System Overview

This app has grown into **two capabilities** on one codebase:

1. **Vehicle visit tracking** — configure delivery routes and automatically capture
   every time a vehicle reaches a drop point (with odometer), for billable km.
2. **MIS → Swipe invoicing** — upload a monthly MIS Excel and generate a GST
   e-invoice for the summed zone totals via the Swipe partner API.

Everything is per-user (authentication-scoped).

---

## Tech stack

- **TanStack Start** (React 19, SSR, file-based routing) + **TanStack Query**
- **Convex** (database, queries/mutations, actions for external HTTP, cron jobs, reactive queries, file storage)
- **Better Auth** (email/password, magic link, Google/GitHub, 2FA)
- **shadcn/ui + Tailwind v4 + TypeScript**
- **MapLibre GL / mapcn** (maps, free CARTO tiles)
- **OSRM** (route optimization — public demo by default)
- **SheetJS (`xlsx`)** (client-side Excel parsing)
- **Swipe** partner API (invoice generation)
- External **Euler Logistics IoT API** (vehicle location + odometer)

---

## Capability 1 — Vehicle visit tracking

### The problem

Vehicles run delivery routes; we need to know, automatically, every time a vehicle
reaches a drop point — with its odometer — including repeat and ad-hoc rounds, and
bill only the km driven on-route (not the dead distance between rounds).

### How a user uses it

1. **Sign up.**
2. **Create a route** — name, vehicle number, an **active-hours window** (when to
   watch, e.g. 5–9 PM), and **drop points** (name, lat/lng, geofence radius; default
   100 m).
3. **Done** — the system watches automatically. For two rounds on the same route,
   create **two routes** with different active hours so between-round distance is not
   billed.

### How it works (automatic)

- A **cron every 2 minutes** polls each vehicle whose active-hours window is currently
  open — **one IoT call per vehicle** (respects the IoT 1 req/min/vehicle limit).
- It measures distance to each drop point and detects a **geofence entry**
  (outside → inside) with **hysteresis** (enter ≤ radius, exit > radius + 50 m) so one
  pass logs exactly one visit.
- Each entry logs a **visit** (odometer, coordinates, time, distance); the visit is
  closed on exit and its **dwell** recorded.
- Days are **operational days: 5 PM → 7 AM IST** (not midnight-to-midnight). A time
  before 5 PM belongs to the previous day's window; morning stop times roll to the
  next calendar day.

### What the user sees

- **Dashboard** (`/`) — for the selected day, each route's drop points with their
  **visits** (time · odometer · dwell · distance), a visit count, and **billable km**
  (= last − first odometer that day, so dead distance between rounds isn't counted).
  Date filter for history. Updates live via Convex reactivity.
- **Map page** (`/daily/$routeId`) — a large MapLibre map with drop points + the
  **live vehicle** + the **OSRM-optimized route**, alongside a vertical timeline of
  the route's visits.

### Backend

- Tables: `routes`, `routeStops`, `visits`, `monitorState`
  (legacy `dailyRoutes` / `dailyStops` remain defined but are unused).
- Functions:
  - `convex/routes.ts` — route config CRUD (name, vehicle, active hours, drop points + radius)
  - `convex/monitoring.ts` — `tick` (poll open windows) → `pollVehicle` (one IoT call)
    → `evaluateEntries` (geofence entry/exit → visit log)
  - `convex/visits.ts` — `dashboard` (visits per point + billable km) and `byRouteDate`
  - `convex/vehicles.ts` — `getCurrentPosition` (live position for the map)
  - `convex/routing.ts` — `getOptimizedRoute` (OSRM trip)
  - `convex/lib/*` — `time` (IST + operational-day math), `geo` (haversine + location
    parsing), `iot` (Euler API), `osrm` (trip service)
  - `convex/crons.ts` — the 2-minute monitoring cron

### Billable km

Per route, per day: `max(odometer) − min(odometer)` over that day's visits (equivalently
last − first, since the odometer is monotonic). Two rounds are two routes, so each
re-baselines and the between-round (home) distance is never counted. A customer's total
is the sum of that customer's route cards for the day.

---

## Capability 2 — Invoice from MIS (Swipe)

### The problem

Each month there's an MIS Excel with per-zone totals; we need a GST e-invoice for the
sum of those totals.

### How a user uses it

Page: `src/routes/_authed/invoice.tsx` (`/invoice`).

1. **Upload the MIS `.xlsx`** — parsed in the browser (SheetJS). Handles **both**
   layouts:
   - **Summary sheet** — header row with `Route` + `Total` columns.
   - **Wide daily sheet (Sheet3)** — `Date` in column A, with repeating
     `[Route · Amount/Day · Extra Kms/Day · Extra Kms Amount/Day · TOTAL]` groups; reads
     the bottom totals row (falls back to summing each zone's daily TOTAL column).
2. It **sums every zone total** → grand total, shown in a preview table with
   taxable + GST + total.
3. Fill **customer + settings** (prefilled from the sample buyer), GST %, itemize
   toggle, invoice date, notes.
4. **Generate Swipe invoice** — a Convex action (`convex/invoices.ts`) `POST`s to the
   Swipe partner API (`/v2/doc`) and returns the invoice number.

### Important: what the Swipe payload controls vs the Swipe account

- **Seller name, GSTIN, bank details, tax (CGST/SGST), Place of Supply** all come from
  the **Swipe account tied to the API token** — NOT from our payload. To get the
  GST-registered, branded invoice, `SWIPE_API_TOKEN` must be that account's token.
- Our payload sends the **customer** (buyer) + **line items** only. Each line is
  "Logistics Services", **SAC 998711**, 5% GST. Swipe splits CGST/SGST vs IGST itself.
- The seller **address** can optionally be overridden via `company_billing_address`
  (name/GSTIN cannot).
- A tax/Place-of-Supply-less invoice means the token's account is **not GST-registered**.

### Backend

- `convex/invoices.ts`:
  - `createInvoice` — builds the Swipe payload from parsed zones + customer + settings
    and creates the invoice.
  - `getInvoicePdf` — fetches the invoice PDF from Swipe and stores it in Convex
    storage, returning a download URL (no UI button wired yet).

---

## Automatic vs manual

| Automatic                                                                 | Manual / config                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------- |
| Polling, geofence capture, visit logging, billable km, live dashboard/map | Create/edit routes; upload MIS + generate invoice |
| Operational-day grouping and day rollover                                 | Set environment keys (below)                      |

## Environment / config

Set on the Convex deployment (`npx convex env set <KEY> <value>`):

- `IOT_API_KEY` — Euler Logistics IoT (required for real capture)
- `OSRM_BASE_URL` — optional; defaults to the public OSRM demo
- `SWIPE_API_TOKEN` — Swipe partner token; **must be the GST-registered account** to
  get seller branding + tax on invoices

## Known open items

- IoT `location` lat/lng order relies on an India-bounds heuristic — confirm with one
  real call.
- No historical vehicle-track playback; live position / OSRM reflect "now".
- Invoice PDF download button not wired to `getInvoicePdf` yet.
- Legacy `dailyRoutes` / `dailyStops` tables remain defined but unused.

---

## In one line

Configure routes (vehicle + active hours + drop points) and the app auto-logs every
geofence visit with odometer for billable km on a live dashboard + map; separately,
upload the monthly MIS Excel and it generates a Swipe GST e-invoice for the summed zone
totals.
