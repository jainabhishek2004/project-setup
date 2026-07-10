import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { XIcon, Truck, Loader2, CalendarDays, Gauge, Map, MapPin } from "lucide-react";
import { a as api, o as operationalDateString } from "./router-AUTNzD8t.js";
import { A as AppHeader } from "./AppHeader-DTCaF19G.js";
import { useMutation } from "convex/react";
import { e as cn, B as Button, C as Card, d as CardContent, a as CardHeader, b as CardTitle, c as CardDescription } from "./card--6FQJDdo.js";
import { I as Input } from "./input-CitDmZ7s.js";
import { L as Label } from "./label-CcZ7vISR.js";
import { C as Checkbox } from "./checkbox-C-8O2gwD.js";
import { Dialog as Dialog$1 } from "radix-ui";
import { B as Badge } from "./badge-3R1KTWK3.js";
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
import "@radix-ui/react-checkbox";
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
const REG_RE = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/;
const cleanReg = (s) => s.trim().replace(/[\s-]/g, "").toUpperCase();
function RouteDayOverrideDialog({
  routeId,
  date,
  defaultVehicle,
  override
}) {
  const setOverride = useMutation(api.overrides.set);
  const clearOverride = useMutation(api.overrides.clear);
  const [open, setOpen] = useState(false);
  const [vehicle, setVehicle] = useState(override?.vehicleRegistration ?? "");
  const [thirdParty, setThirdParty] = useState(
    override ? !override.trackable : false
  );
  const [vendorName, setVendorName] = useState(override?.vendorName ?? "Porter");
  const [vendorCost, setVendorCost] = useState(
    override?.vendorCost != null ? String(override.vendorCost) : ""
  );
  const [manualKm, setManualKm] = useState(
    override?.manualKm != null ? String(override.manualKm) : ""
  );
  const [reason, setReason] = useState(override?.reason ?? "");
  const [notes, setNotes] = useState(override?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const num = (s) => {
    const n = Number(s);
    return s.trim() === "" || Number.isNaN(n) ? void 0 : n;
  };
  const handleSave = async () => {
    if (thirdParty) {
      if (!vendorName.trim()) {
        toast.error("Enter the vendor name (e.g. Porter)");
        return;
      }
    } else {
      if (!REG_RE.test(cleanReg(vehicle))) {
        toast.error("Enter a valid vehicle number, e.g. DL51GD8989");
        return;
      }
    }
    const vehicleRegistration = thirdParty ? vehicle.trim() ? cleanReg(vehicle) : vendorName.trim() : cleanReg(vehicle);
    setSaving(true);
    try {
      await setOverride({
        routeId,
        date,
        vehicleRegistration,
        trackable: !thirdParty,
        vendorName: thirdParty ? vendorName.trim() : void 0,
        vendorCost: thirdParty ? num(vendorCost) : void 0,
        manualKm: thirdParty ? num(manualKm) : void 0,
        reason: reason.trim() || void 0,
        notes: notes.trim() || void 0
      });
      toast.success("Vehicle updated for this day");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Could not save override");
    } finally {
      setSaving(false);
    }
  };
  const handleClear = async () => {
    setSaving(true);
    try {
      await clearOverride({ routeId, date });
      toast.success("Reverted to the default vehicle");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Could not clear override");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", children: [
      /* @__PURE__ */ jsx(Truck, { className: "size-4" }),
      " Change vehicle"
    ] }) }),
    /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { children: [
          "Change vehicle for ",
          date
        ] }),
        /* @__PURE__ */ jsxs(DialogDescription, { children: [
          "Default vehicle is ",
          /* @__PURE__ */ jsx("b", { children: defaultVehicle }),
          ". Set the vehicle that ran this day — a breakdown substitute (tracked live) or a third-party vehicle (manual)."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              checked: thirdParty,
              onCheckedChange: (c) => setThirdParty(c === true)
            }
          ),
          "Third-party vehicle (no IoT, e.g. Porter) — tracked manually"
        ] }),
        !thirdParty ? /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
          /* @__PURE__ */ jsx(Label, { children: "Substitute vehicle number" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              value: vehicle,
              onChange: (e) => setVehicle(e.target.value.toUpperCase()),
              placeholder: "DL51GD8989",
              autoCapitalize: "characters"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-xs", children: "Must be a valid registration — it's tracked live via IoT." })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "grid gap-4 rounded-lg border p-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Vendor name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: vendorName,
                onChange: (e) => setVendorName(e.target.value),
                placeholder: "Porter"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Vendor cost (₹)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: vendorCost,
                onChange: (e) => setVendorCost(e.target.value),
                inputMode: "numeric",
                placeholder: "4500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Km driven (manual)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: manualKm,
                onChange: (e) => setManualKm(e.target.value),
                inputMode: "numeric",
                placeholder: "optional"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Vehicle number (optional)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: vehicle,
                onChange: (e) => setVehicle(e.target.value.toUpperCase()),
                placeholder: "if known"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Reason" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: reason,
                onChange: (e) => setReason(e.target.value),
                placeholder: "Breakdown"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Notes" }),
            /* @__PURE__ */ jsx(Input, { value: notes, onChange: (e) => setNotes(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          override ? /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: handleClear, disabled: saving, children: "Clear override" }) : /* @__PURE__ */ jsx("span", {}),
          /* @__PURE__ */ jsx(Button, { onClick: handleSave, disabled: saving, children: saving ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : "Save" })
        ] })
      ] })
    ] })
  ] });
}
function minutesToLabel(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  const p = (x) => String(x).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`;
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
  const isFuture = selectedDate > today;
  const maxDate = addDays(today, 14);
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
          isToday && " · today",
          isFuture && " · upcoming"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "route-date", className: "text-xs", children: "Date (pick a future day to pre-assign a vehicle)" }),
          /* @__PURE__ */ jsx(Input, { id: "route-date", type: "date", value: selectedDate, max: maxDate, onChange: (e) => setSelectedDate(e.target.value || today), className: "w-40" })
        ] }),
        !isToday && /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => setSelectedDate(today), children: "Today" }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setSelectedDate(addDays(selectedDate, 1)), disabled: selectedDate >= maxDate, children: "Next day →" })
      ] })
    ] }),
    routes.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "text-muted-foreground py-10 text-center", children: [
      "No routes configured.",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/routes", className: "text-orange-400 underline", children: "Create a route" }),
      " ",
      "to start tracking visits."
    ] }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-6", children: routes.map((route) => /* @__PURE__ */ jsx(RouteVisitsCard, { route, date: selectedDate }, route._id)) }),
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
function RouteVisitsCard({
  route,
  date
}) {
  const visitedStops = [...route.stops].filter((s) => s.visits.length > 0).sort((a, b) => a.visits[0].enteredAt - b.visits[0].enteredAt);
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          route.name,
          !route.isActive && /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "inactive" }),
          route.override && /* @__PURE__ */ jsx(Badge, { variant: route.override.trackable ? "outline" : "destructive", children: route.override.trackable ? "substitute" : route.override.vendorName ?? "vendor" })
        ] }),
        /* @__PURE__ */ jsxs(CardDescription, { children: [
          "Vehicle ",
          route.effectiveVehicle,
          route.override && /* @__PURE__ */ jsxs(Fragment, { children: [
            " (default ",
            route.vehicleRegistration,
            ")"
          ] }),
          route.activeStartMinutes != null && route.activeEndMinutes != null && /* @__PURE__ */ jsxs(Fragment, { children: [
            " ",
            "· ",
            minutesToLabel(route.activeStartMinutes),
            "–",
            minutesToLabel(route.activeEndMinutes)
          ] }),
          " ",
          "· ",
          visitedStops.length,
          " hub",
          visitedStops.length === 1 ? "" : "s",
          " visited · ",
          route.totalVisits,
          " ",
          "visit(s)",
          route.override?.vendorCost != null && /* @__PURE__ */ jsxs(Fragment, { children: [
            " · vendor cost ₹",
            route.override.vendorCost.toLocaleString()
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        route.billableKm != null && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-sm font-medium", children: [
          /* @__PURE__ */ jsx(Gauge, { size: 14 }),
          " ",
          route.billableKm.toLocaleString(),
          " km"
        ] }),
        /* @__PURE__ */ jsx(RouteDayOverrideDialog, { routeId: route._id, date, defaultVehicle: route.vehicleRegistration, override: route.override }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/daily/$routeId", params: {
          routeId: route._id
        }, children: [
          /* @__PURE__ */ jsx(Map, { className: "size-4" }),
          " Map"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { className: "space-y-3", children: visitedStops.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "No hubs visited yet today." }) : visitedStops.map((stop) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border p-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-sm font-medium", children: [
          /* @__PURE__ */ jsx(MapPin, { size: 14 }),
          " ",
          stop.name
        ] }),
        stop.visits.length > 1 && /* @__PURE__ */ jsxs(Badge, { children: [
          stop.visits.length,
          " visits"
        ] })
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "text-muted-foreground mt-2 space-y-1 text-xs", children: stop.visits.map((visit) => /* @__PURE__ */ jsxs("li", { className: "flex flex-wrap items-center gap-x-3 gap-y-0.5", children: [
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
