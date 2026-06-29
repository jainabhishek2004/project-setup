import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Toaster, toast } from "sonner";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation } from "convex/react";
import { CalendarDays, Loader2, Plus, Map as Map$1, Gauge } from "lucide-react";
import { o as operationalDateString, a as api } from "./router-BY3u6Q8c.js";
import { A as AppHeader } from "./AppHeader-DqvummcP.js";
import { c as cn, B as Button } from "./button-Cm5QyDGI.js";
import { L as Label, I as Input } from "./label-BKqcuK7M.js";
import { B as Badge } from "./badge-BclCsA64.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./card-rgUlqyCc.js";
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
import "@better-auth/core/utils/error-codes";
import "@better-auth/core/env";
import "@better-auth/core/error";
import "@better-auth/core/utils/url";
import "nanostores";
import "defu";
import "@better-fetch/fetch";
import "@better-auth/core/utils/string";
import "convex/server";
import "./auth-server-OeSBPYOe.js";
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
function Table({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "table-container",
      className: "relative w-full overflow-x-auto",
      children: /* @__PURE__ */ jsx(
        "table",
        {
          "data-slot": "table",
          className: cn("w-full caption-bottom text-sm", className),
          ...props
        }
      )
    }
  );
}
function TableHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "thead",
    {
      "data-slot": "table-header",
      className: cn("[&_tr]:border-b", className),
      ...props
    }
  );
}
function TableBody({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tbody",
    {
      "data-slot": "table-body",
      className: cn("[&_tr:last-child]:border-0", className),
      ...props
    }
  );
}
function TableRow({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tr",
    {
      "data-slot": "table-row",
      className: cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      ),
      ...props
    }
  );
}
function TableHead({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "th",
    {
      "data-slot": "table-head",
      className: cn(
        "text-muted-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      ),
      ...props
    }
  );
}
function TableCell({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "td",
    {
      "data-slot": "table-cell",
      className: cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      ),
      ...props
    }
  );
}
function minutesToLabel(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
const statusVariant = {
  pending: "secondary",
  polling: "outline",
  captured: "default",
  missed: "destructive",
  active: "outline",
  completed: "default"
};
function Dashboard() {
  const today = operationalDateString();
  const [selectedDate, setSelectedDate] = useState(today);
  const isToday = selectedDate === today;
  const {
    data,
    isFetching
  } = useQuery({
    ...convexQuery(api.dailyRoutes.byDate, {
      date: selectedDate
    }),
    placeholderData: keepPreviousData
  });
  const generate = useMutation(api.dailyRoutes.generateToday);
  const [generating, setGenerating] = useState(false);
  const dailyRoutes = data?.dailyRoutes ?? [];
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generate({});
      setSelectedDate(today);
      toast.success(res.created > 0 ? `Generated ${res.created} route(s) for today` : "Today is already up to date");
    } catch (err) {
      toast.error("Could not generate daily routes");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto min-h-screen w-full max-w-5xl space-y-6 p-4", children: [
    /* @__PURE__ */ jsx(AppHeader, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-xl font-semibold", children: [
          /* @__PURE__ */ jsx(CalendarDays, { size: 20 }),
          " Daily routes",
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
        !isToday && /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => setSelectedDate(today), children: "Today" }),
        isToday && /* @__PURE__ */ jsxs(Button, { onClick: handleGenerate, disabled: generating, children: [
          generating ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsx(Plus, { size: 16 }),
          "Generate today"
        ] })
      ] })
    ] }),
    dailyRoutes.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "text-muted-foreground py-10 text-center", children: isToday ? /* @__PURE__ */ jsxs(Fragment, { children: [
      "No daily routes yet for today.",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/routes", className: "text-orange-400 underline", children: "Configure a route" }),
      " ",
      "then click “Generate today”."
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      "No routes were recorded on ",
      selectedDate,
      "."
    ] }) }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-6", children: dailyRoutes.map((dr) => /* @__PURE__ */ jsx(DailyRouteCard, { dailyRoute: dr }, dr._id)) }),
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
function DailyRouteCard({
  dailyRoute
}) {
  const setRouteOdometer = useMutation(api.dailyRoutes.setRouteOdometer);
  const kmTravelledByStop = useMemo(() => {
    const result = /* @__PURE__ */ new Map();
    let prevOdometer = null;
    for (const stop of dailyRoute.stops) {
      if (stop.isStart) {
        result.set(stop._id, 0);
        prevOdometer = stop.odometer ?? prevOdometer;
        continue;
      }
      const km = stop.odometer != null && prevOdometer != null ? Math.max(0, stop.odometer - prevOdometer) : null;
      result.set(stop._id, km);
      prevOdometer = stop.odometer ?? prevOdometer;
    }
    return result;
  }, [dailyRoute.stops]);
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          dailyRoute.routeName,
          /* @__PURE__ */ jsx(Badge, { variant: statusVariant[dailyRoute.status], children: dailyRoute.status })
        ] }),
        /* @__PURE__ */ jsxs(CardDescription, { children: [
          "Vehicle ",
          dailyRoute.vehicleRegistration
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/daily/$dailyRouteId", params: {
          dailyRouteId: dailyRoute._id
        }, children: [
          /* @__PURE__ */ jsx(Map$1, { className: "size-4" }),
          " Map"
        ] }) }),
        /* @__PURE__ */ jsx(OdometerControl, { label: "Route odometer", value: dailyRoute.odometer, onSave: (odometer) => setRouteOdometer({
          id: dailyRoute._id,
          odometer
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "#" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Drop point" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Expected" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Location (lat, lng)" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Odometer" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Km travelled" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Captured (Lat, Lng)" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Captured Time" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: dailyRoute.stops.map((stop) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { children: stop.isStart ? /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Start" }) : stop.order + 1 }),
        /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: stop.name }),
        /* @__PURE__ */ jsx(TableCell, { children: minutesToLabel(stop.expectedMinutes) }),
        /* @__PURE__ */ jsxs(TableCell, { className: "text-muted-foreground", children: [
          stop.targetLat.toFixed(5),
          ", ",
          stop.targetLng.toFixed(5)
        ] }),
        /* @__PURE__ */ jsxs(TableCell, { children: [
          /* @__PURE__ */ jsx(Badge, { variant: statusVariant[stop.status], children: stop.status }),
          stop.status === "polling" && stop.lastDistanceMeters != null && /* @__PURE__ */ jsxs("div", { className: "text-muted-foreground mt-1 text-xs", children: [
            Math.round(stop.lastDistanceMeters),
            " m away"
          ] })
        ] }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StopOdometerControl, { stopId: stop._id, value: stop.odometer }) }),
        /* @__PURE__ */ jsx(TableCell, { children: (() => {
          const km = kmTravelledByStop.get(stop._id);
          return km != null ? /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            km.toLocaleString(void 0, {
              maximumFractionDigits: 1
            }),
            " ",
            "km"
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "—" });
        })() }),
        /* @__PURE__ */ jsx(TableCell, { children: stop.capturedLat != null && stop.capturedLng != null ? /* @__PURE__ */ jsxs("span", { children: [
          stop.capturedLat.toFixed(5),
          ",",
          " ",
          stop.capturedLng.toFixed(5)
        ] }) : null }),
        /* @__PURE__ */ jsx(TableCell, { children: stop.status === "captured" && stop.capturedAt != null ? /* @__PURE__ */ jsx("span", { children: new Date(stop.capturedAt).toLocaleTimeString() }) : null })
      ] }, stop._id)) })
    ] }) })
  ] });
}
function StopOdometerControl({
  stopId,
  value
}) {
  const setStopOdometer = useMutation(api.dailyRoutes.setStopOdometer);
  return /* @__PURE__ */ jsx(OdometerControl, { value, onSave: (odometer) => setStopOdometer({
    id: stopId,
    odometer
  }) });
}
function OdometerControl({
  value,
  onSave,
  label
}) {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    const odometer = Number(draft);
    if (!draft || Number.isNaN(odometer)) {
      toast.error("Enter a valid odometer reading");
      return;
    }
    setSaving(true);
    try {
      await onSave(odometer);
      setDraft("");
      toast.success("Odometer saved");
    } catch (err) {
      toast.error("Could not save odometer");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
    value != null && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-sm font-medium", children: [
      /* @__PURE__ */ jsx(Gauge, { size: 14 }),
      " ",
      value.toLocaleString(),
      " km"
    ] }),
    /* @__PURE__ */ jsx(Input, { value: draft, onChange: (e) => setDraft(e.target.value), placeholder: label ?? "Odometer", inputMode: "numeric", className: "h-8 w-28" }),
    /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", disabled: saving, onClick: handleSave, children: "Set" })
  ] });
}
export {
  Dashboard as component
};
