import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast, Toaster } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation } from "convex/react";
import { ArrowLeft, Map, Pencil, Trash2 } from "lucide-react";
import { R as Route, a as api } from "./router-AUTNzD8t.js";
import { A as AppHeader } from "./AppHeader-DTCaF19G.js";
import { B as Button, C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card--6FQJDdo.js";
import { B as Badge } from "./badge-3R1KTWK3.js";
import { S as Switch, A as AlertDialog, h as AlertDialogTrigger, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-B2skkYR0.js";
import { L as Label } from "./label-CcZ7vISR.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DRgWIDjE.js";
import "@tanstack/react-router-ssr-query";
import "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
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
import "radix-ui";
import "@radix-ui/react-label";
function minutesToLabel(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function RouteDetail() {
  const {
    routeId
  } = Route.useParams();
  const id = routeId;
  const navigate = useNavigate();
  const {
    data: route
  } = useSuspenseQuery(convexQuery(api.routes.get, {
    id
  }));
  const setActive = useMutation(api.routes.setActive);
  const remove = useMutation(api.routes.remove);
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto min-h-screen w-full max-w-4xl space-y-4 p-4", children: [
    /* @__PURE__ */ jsx(AppHeader, {}),
    /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", asChild: true, className: "-ml-2 w-fit", children: /* @__PURE__ */ jsxs(Link, { to: "/routes", children: [
      /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }),
      " Back to routes"
    ] }) }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row flex-wrap items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-2xl", children: [
            route.name,
            /* @__PURE__ */ jsx(Badge, { variant: route.isActive ? "default" : "secondary", children: route.isActive ? "active" : "inactive" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mt-1 text-sm", children: [
            "Vehicle ",
            /* @__PURE__ */ jsx("b", { children: route.vehicleRegistration }),
            route.activeStartMinutes != null && route.activeEndMinutes != null && /* @__PURE__ */ jsxs(Fragment, { children: [
              " ",
              "· active ",
              minutesToLabel(route.activeStartMinutes),
              "–",
              minutesToLabel(route.activeEndMinutes)
            ] }),
            " ",
            "· ",
            route.stops.length,
            " drop point(s)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Switch, { id: "active", checked: route.isActive, onCheckedChange: (v) => setActive({
              id,
              isActive: v
            }) }),
            /* @__PURE__ */ jsx(Label, { htmlFor: "active", className: "text-sm", children: "Active" })
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/daily/$routeId", params: {
            routeId: id
          }, children: [
            /* @__PURE__ */ jsx(Map, { className: "size-4" }),
            " Map"
          ] }) }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/routes/$routeId/edit", params: {
            routeId: id
          }, children: [
            /* @__PURE__ */ jsx(Pencil, { className: "size-4" }),
            " Edit"
          ] }) }),
          /* @__PURE__ */ jsxs(AlertDialog, { children: [
            /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "text-red-500 hover:text-red-600", children: [
              /* @__PURE__ */ jsx(Trash2, { className: "size-4" }),
              " Delete"
            ] }) }),
            /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
              /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
                /* @__PURE__ */ jsxs(AlertDialogTitle, { children: [
                  "Delete “",
                  route.name,
                  "”?"
                ] }),
                /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This permanently removes the route and its drop points. Past visits and overrides are kept. This can't be undone." })
              ] }),
              /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
                /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
                /* @__PURE__ */ jsx(AlertDialogAction, { className: "bg-red-600 hover:bg-red-700", onClick: async () => {
                  await remove({
                    id
                  });
                  toast.success("Route deleted");
                  await navigate({
                    to: "/routes"
                  });
                }, children: "Delete" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-2 text-sm font-medium", children: "Drop points" }),
        /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { children: "#" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Latitude" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Longitude" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Radius" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: route.stops.map((s) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { children: s.order + 1 }),
            /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
              s.name,
              s.optional && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "font-normal", children: "optional" })
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground", children: s.lat.toFixed(5) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground", children: s.lng.toFixed(5) }),
            /* @__PURE__ */ jsxs(TableCell, { className: "text-right", children: [
              s.radiusMeters ?? 100,
              " m"
            ] })
          ] }, s._id)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
export {
  RouteDetail as component
};
