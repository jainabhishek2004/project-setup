import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "sonner";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { CalendarDays, Loader2, Gauge, Map, MapPin } from "lucide-react";
import { o as operationalDateString, a as api } from "./router-4kTeY6y1.js";
import { A as AppHeader } from "./AppHeader-rUzkVB5l.js";
import { B as Button, C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./card-CmruOdWT.js";
import { L as Label, I as Input } from "./label-BtOcBn8z.js";
import { B as Badge } from "./badge-BE5NQcX_.js";
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
import "@radix-ui/react-label";
function minutesToLabel(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function clockTime(ms) {
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}
function Dashboard() {
  const today = operationalDateString();
  const [selectedDate, setSelectedDate] = useState(today);
  const isToday = selectedDate === today;
  const {
    data,
    isFetching
  } = useQuery({
    ...convexQuery(api.visits.dashboard, {
      date: selectedDate
    }),
    placeholderData: keepPreviousData
  });
  const routes = data?.routes ?? [];
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto min-h-screen w-full max-w-5xl space-y-6 p-4", children: [
    /* @__PURE__ */ jsx(AppHeader, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-xl font-semibold", children: [
          /* @__PURE__ */ jsx(CalendarDays, { size: 20 }),
          " Visits",
          isFetching && /* @__PURE__ */ jsx(Loader2, { size: 16, className: "text-muted-foreground animate-spin" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-sm", children: [
          selectedDate,
          " · 5 PM–7 AM (IST)",
          isToday && " · today"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "route-date", className: "text-xs", children: "Date" }),
          /* @__PURE__ */ jsx(Input, { id: "route-date", type: "date", value: selectedDate, max: today, onChange: (e) => setSelectedDate(e.target.value || today), className: "w-40" })
        ] }),
        !isToday && /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => setSelectedDate(today), children: "Today" })
      ] })
    ] }),
    routes.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "text-muted-foreground py-10 text-center", children: [
      "No routes configured.",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/routes", className: "text-orange-400 underline", children: "Create a route" }),
      " ",
      "to start tracking visits."
    ] }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-6", children: routes.map((route) => /* @__PURE__ */ jsx(RouteVisitsCard, { route }, route._id)) }),
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
function RouteVisitsCard({
  route
}) {
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          route.name,
          !route.isActive && /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "inactive" })
        ] }),
        /* @__PURE__ */ jsxs(CardDescription, { children: [
          "Vehicle ",
          route.vehicleRegistration,
          route.activeStartMinutes != null && route.activeEndMinutes != null && /* @__PURE__ */ jsxs(Fragment, { children: [
            " ",
            "· ",
            minutesToLabel(route.activeStartMinutes),
            "–",
            minutesToLabel(route.activeEndMinutes)
          ] }),
          " ",
          "· ",
          route.totalVisits,
          " visit(s)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        route.billableKm != null && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-sm font-medium", children: [
          /* @__PURE__ */ jsx(Gauge, { size: 14 }),
          " ",
          route.billableKm.toLocaleString(),
          " km"
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/daily/$routeId", params: {
          routeId: route._id
        }, children: [
          /* @__PURE__ */ jsx(Map, { className: "size-4" }),
          " Map"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { className: "space-y-3", children: route.stops.map((stop) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border p-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-sm font-medium", children: [
          /* @__PURE__ */ jsx(MapPin, { size: 14 }),
          " ",
          stop.order + 1,
          ". ",
          stop.name
        ] }),
        /* @__PURE__ */ jsxs(Badge, { variant: stop.visits.length > 0 ? "default" : "secondary", children: [
          stop.visits.length,
          " visit(s)"
        ] })
      ] }),
      stop.visits.length > 0 && /* @__PURE__ */ jsx("ul", { className: "text-muted-foreground mt-2 space-y-1 text-xs", children: stop.visits.map((visit) => /* @__PURE__ */ jsxs("li", { className: "flex flex-wrap items-center gap-x-3 gap-y-0.5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: clockTime(visit.enteredAt) }),
        visit.odometer != null && /* @__PURE__ */ jsxs("span", { children: [
          "odo ",
          visit.odometer.toLocaleString(),
          " km"
        ] }),
        visit.dwellSeconds != null && /* @__PURE__ */ jsxs("span", { children: [
          Math.round(visit.dwellSeconds / 60),
          " min stay"
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          Math.round(visit.distanceMeters),
          " m from centre"
        ] })
      ] }, visit._id)) })
    ] }, stop._id)) })
  ] });
}
export {
  Dashboard as component
};
