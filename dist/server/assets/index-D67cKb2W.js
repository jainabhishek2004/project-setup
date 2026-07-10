import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation } from "convex/react";
import { Truck, Plus, Pencil, Trash2 } from "lucide-react";
import { a as api } from "./router-AUTNzD8t.js";
import { A as AppHeader } from "./AppHeader-DTCaF19G.js";
import { B as Button, C as Card, d as CardContent } from "./card--6FQJDdo.js";
import { I as Input } from "./input-CitDmZ7s.js";
import { S as Switch, A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-B2skkYR0.js";
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
function minutesToLabel(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function RoutesList() {
  const {
    data: routes
  } = useSuspenseQuery(convexQuery(api.routes.list, {}));
  const setActive = useMutation(api.routes.setActive);
  const remove = useMutation(api.routes.remove);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const q = query.trim().toLowerCase();
  const filtered = q ? routes.filter((r) => r.name.toLowerCase().includes(q) || r.vehicleRegistration.toLowerCase().includes(q)) : routes;
  const openDetail = (id) => navigate({
    to: "/routes/$routeId",
    params: {
      routeId: id
    }
  });
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto min-h-screen w-full max-w-5xl space-y-6 p-4", children: [
    /* @__PURE__ */ jsx(AppHeader, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-xl font-semibold", children: [
        /* @__PURE__ */ jsx(Truck, { size: 20 }),
        " Configured routes"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Input, { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search name or vehicle…", className: "w-56" }),
        /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/routes/new", children: [
          /* @__PURE__ */ jsx(Plus, { size: 16 }),
          " New route"
        ] }) })
      ] })
    ] }),
    routes.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "text-muted-foreground py-10 text-center", children: "No routes configured yet. Create your first route to start tracking." }) }) : /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Route" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Vehicle" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Active hours" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Hubs" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Active" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxs(TableBody, { children: [
        filtered.map((route) => /* @__PURE__ */ jsxs(TableRow, { className: "cursor-pointer", onClick: () => openDetail(route._id), children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: route.name }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground", children: route.vehicleRegistration }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground", children: route.activeStartMinutes != null && route.activeEndMinutes != null ? `${minutesToLabel(route.activeStartMinutes)}–${minutesToLabel(route.activeEndMinutes)}` : "—" }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: route.stops.length }),
          /* @__PURE__ */ jsx(TableCell, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(Switch, { checked: route.isActive, onCheckedChange: (v) => setActive({
            id: route._id,
            isActive: v
          }), "aria-label": "Active" }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1", children: [
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/routes/$routeId/edit", params: {
              routeId: route._id
            }, children: /* @__PURE__ */ jsx(Pencil, { size: 16 }) }) }),
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "text-muted-foreground hover:text-red-500", onClick: () => setToDelete({
              id: route._id,
              name: route.name
            }), children: /* @__PURE__ */ jsx(Trash2, { size: 16 }) })
          ] }) })
        ] }, route._id)),
        filtered.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsxs(TableCell, { colSpan: 6, className: "text-muted-foreground py-8 text-center", children: [
          "No routes match “",
          query,
          "”."
        ] }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: toDelete !== null, onOpenChange: (o) => !o && setToDelete(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxs(AlertDialogTitle, { children: [
          "Delete “",
          toDelete?.name,
          "”?"
        ] }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This permanently removes the route and its drop points. Past visits and overrides are kept. This can't be undone." })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { className: "bg-red-600 hover:bg-red-700", onClick: async () => {
          if (!toDelete) return;
          await remove({
            id: toDelete.id
          });
          toast.success("Route deleted");
          setToDelete(null);
        }, children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
export {
  RoutesList as component
};
