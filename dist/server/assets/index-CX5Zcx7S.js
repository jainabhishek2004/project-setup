import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, Suspense, lazy } from "react";
import { Toaster, toast } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation } from "convex/react";
import { XIcon, Map, Loader2, CalendarDays, Plus, Gauge } from "lucide-react";
import { a as api } from "./router-DvbOsvLg.js";
import { A as AppHeader } from "./AppHeader-MeujYOXz.js";
import { e as cn, B as Button, C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./card-CmruOdWT.js";
import { Dialog as Dialog$1 } from "radix-ui";
import { I as Input } from "./input-Dm3-TbeB.js";
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
function Dialog({
  ...props
}) {
  return /* @__PURE__ */ jsx(Dialog$1.Root, { "data-slot": "dialog", ...props });
}
function DialogTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(Dialog$1.Trigger, { "data-slot": "dialog-trigger", ...props });
}
function DialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(Dialog$1.Portal, { "data-slot": "dialog-portal", ...props });
}
function DialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Overlay,
    {
      "data-slot": "dialog-overlay",
      className: cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      ),
      ...props
    }
  );
}
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  return /* @__PURE__ */ jsxs(DialogPortal, { "data-slot": "dialog-portal", children: [
    /* @__PURE__ */ jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsxs(
      Dialog$1.Content,
      {
        "data-slot": "dialog-content",
        className: cn(
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg",
          className
        ),
        ...props,
        children: [
          children,
          showCloseButton && /* @__PURE__ */ jsxs(
            Dialog$1.Close,
            {
              "data-slot": "dialog-close",
              className: "absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              children: [
                /* @__PURE__ */ jsx(XIcon, {}),
                /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
              ]
            }
          )
        ]
      }
    )
  ] });
}
function DialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function DialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Title,
    {
      "data-slot": "dialog-title",
      className: cn("text-lg leading-none font-semibold", className),
      ...props
    }
  );
}
function DialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Description,
    {
      "data-slot": "dialog-description",
      className: cn("text-sm text-muted-foreground", className),
      ...props
    }
  );
}
const RouteMap = lazy(
  () => import("./RouteMap-DDseXcto.js").then((m) => ({ default: m.RouteMap }))
);
function RouteMapDialog({
  routeName,
  vehicleRegistration,
  stops
}) {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", children: [
      /* @__PURE__ */ jsx(Map, { className: "size-4" }),
      " Map"
    ] }) }),
    /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-3xl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: routeName }),
        /* @__PURE__ */ jsxs(DialogDescription, { children: [
          "Drop points and live location for ",
          vehicleRegistration
        ] })
      ] }),
      open && /* @__PURE__ */ jsx(
        Suspense,
        {
          fallback: /* @__PURE__ */ jsx("div", { className: "flex h-[60vh] max-h-[480px] items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "text-muted-foreground size-6 animate-spin" }) }),
          children: /* @__PURE__ */ jsx(RouteMap, { vehicleRegistration, stops })
        }
      )
    ] })
  ] });
}
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
  const {
    data
  } = useSuspenseQuery(convexQuery(api.dailyRoutes.today, {}));
  const generate = useMutation(api.dailyRoutes.generateToday);
  const [generating, setGenerating] = useState(false);
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generate({});
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
          " Daily routes"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-sm", children: [
          data.date,
          " (IST)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: handleGenerate, disabled: generating, children: [
        /* @__PURE__ */ jsx(Plus, { size: 16 }),
        " Generate today"
      ] })
    ] }),
    data.dailyRoutes.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-10 text-center text-muted-foreground", children: [
      "No daily routes yet for today.",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/routes", className: "text-orange-400 underline", children: "Configure a route" }),
      " ",
      "then click “Generate today”."
    ] }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-6", children: data.dailyRoutes.map((dr) => /* @__PURE__ */ jsx(DailyRouteCard, { dailyRoute: dr }, dr._id)) }),
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
function DailyRouteCard({
  dailyRoute
}) {
  const setRouteOdometer = useMutation(api.dailyRoutes.setRouteOdometer);
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
        /* @__PURE__ */ jsx(RouteMapDialog, { routeName: dailyRoute.routeName, vehicleRegistration: dailyRoute.vehicleRegistration, stops: dailyRoute.stops }),
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
        /* @__PURE__ */ jsx(TableHead, { children: "Captured (Lat, Lng)" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Captured Time" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: dailyRoute.stops.map((stop) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { children: stop.order + 1 }),
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
