import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { Toaster } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { c as Route, a as api } from "./router-Cfo28kxB.js";
import { A as AppHeader } from "./AppHeader-CUBh8qk8.js";
import { c as cn, B as Button, C as Card, b as CardHeader, d as CardTitle, a as CardContent } from "./card-DskBQYqB.js";
import { B as Badge } from "./badge-BqzH4w4b.js";
import "@tanstack/react-router-ssr-query";
import "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router-devtools";
import "@tanstack/react-query-devtools";
import "convex/react";
import "@better-auth/core/utils/error-codes";
import "@better-auth/core/env";
import "@better-auth/core/error";
import "@better-auth/core/utils/url";
import "nanostores";
import "defu";
import "@better-fetch/fetch";
import "@better-auth/core/utils/string";
import "convex/server";
import "./auth-server-BiwouQzf.js";
import "common-tags";
import "convex/browser";
import "@better-auth/utils/base64";
import "@better-auth/utils/binary";
import "@better-auth/utils/hmac";
import "convex-helpers";
import "jose";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
function clockTime(ms) {
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}
function RouteStopsTimeline({ stops }) {
  return /* @__PURE__ */ jsx("ol", { className: "relative", children: stops.map((stop, index) => {
    const isLast = index === stops.length - 1;
    const visited = stop.visits.length > 0;
    return /* @__PURE__ */ jsxs("li", { className: "relative flex gap-3 pb-6 last:pb-0", children: [
      !isLast && /* @__PURE__ */ jsx("span", { className: "bg-border absolute top-7 left-[11px] h-[calc(100%-1.25rem)] w-px" }),
      /* @__PURE__ */ jsx(
        "span",
        {
          className: cn(
            "border-background relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white shadow",
            visited ? "bg-green-500" : "bg-neutral-400"
          ),
          children: stop.order + 1
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "-mt-0.5 flex-1 space-y-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-sm font-medium", children: [
            /* @__PURE__ */ jsx(MapPin, { size: 13 }),
            " ",
            stop.name
          ] }),
          /* @__PURE__ */ jsxs(Badge, { variant: visited ? "default" : "secondary", children: [
            stop.visits.length,
            " visit(s)"
          ] })
        ] }),
        visited && /* @__PURE__ */ jsx("ul", { className: "text-muted-foreground space-y-0.5 text-xs", children: stop.visits.map((visit) => /* @__PURE__ */ jsxs(
          "li",
          {
            className: "flex flex-wrap items-center gap-x-2.5 gap-y-0.5",
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: clockTime(visit.enteredAt) }),
              visit.odometer != null && /* @__PURE__ */ jsxs("span", { children: [
                visit.odometer.toLocaleString(),
                " km"
              ] }),
              visit.dwellSeconds != null && /* @__PURE__ */ jsxs("span", { children: [
                Math.round(visit.dwellSeconds / 60),
                " min"
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                Math.round(visit.distanceMeters),
                " m"
              ] })
            ]
          },
          visit._id
        )) })
      ] })
    ] }, stop._id);
  }) });
}
const RouteMap = lazy(() => import("./RouteMap-C6mZB8ks.js").then((m) => ({
  default: m.RouteMap
})));
function MapPage() {
  const {
    routeId
  } = Route.useParams();
  const id = routeId;
  const {
    data: route
  } = useSuspenseQuery(convexQuery(api.routes.get, {
    id
  }));
  const {
    data: visitsData
  } = useSuspenseQuery(convexQuery(api.visits.byRouteDate, {
    routeId: id
  }));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const visitsByStop = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const visit of visitsData.visits) {
      const key = visit.routeStopId;
      const arr = map.get(key) ?? [];
      arr.push(visit);
      map.set(key, arr);
    }
    return map;
  }, [visitsData.visits]);
  const mapStops = route.stops.map((s) => {
    const visits = visitsByStop.get(s._id) ?? [];
    const last = visits[visits.length - 1];
    const status = visits.length > 0 ? "captured" : "pending";
    return {
      name: s.name,
      order: s.order,
      targetLat: s.lat,
      targetLng: s.lng,
      status,
      odometer: last?.odometer
    };
  });
  const timelineStops = route.stops.map((s) => ({
    _id: s._id,
    name: s.name,
    order: s.order,
    radiusMeters: s.radiusMeters,
    visits: (visitsByStop.get(s._id) ?? []).map((v) => ({
      _id: v._id,
      enteredAt: v.enteredAt,
      odometer: v.odometer,
      dwellSeconds: v.dwellSeconds,
      distanceMeters: v.distanceMeters
    }))
  }));
  const mapFallback = /* @__PURE__ */ jsx("div", { className: "flex h-[72vh] items-center justify-center rounded-lg border", children: /* @__PURE__ */ jsx(Loader2, { className: "text-muted-foreground size-6 animate-spin" }) });
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto min-h-screen w-full max-w-7xl space-y-4 p-4", children: [
    /* @__PURE__ */ jsx(AppHeader, {}),
    /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", asChild: true, className: "-ml-2 w-fit", children: /* @__PURE__ */ jsxs(Link, { to: "/", children: [
      /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }),
      " Back to dashboard"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: route.name }),
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-sm", children: [
        "Drop points and live location for ",
        route.vehicleRegistration,
        " ·",
        " ",
        visitsData.visits.length,
        " visit(s) today"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: mounted ? /* @__PURE__ */ jsx(Suspense, { fallback: mapFallback, children: /* @__PURE__ */ jsx(RouteMap, { vehicleRegistration: route.vehicleRegistration, stops: mapStops, mapClassName: "h-[72vh]" }) }) : mapFallback }),
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-1", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base", children: [
          "Drop points (",
          route.stops.length,
          ")"
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "max-h-[72vh] overflow-y-auto", children: /* @__PURE__ */ jsx(RouteStopsTimeline, { stops: timelineStops }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
export {
  MapPage as component
};
