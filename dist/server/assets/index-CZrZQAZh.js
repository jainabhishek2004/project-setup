import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { toast, Toaster } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation } from "convex/react";
import { Truck, Plus, Pencil, Trash2 } from "lucide-react";
import { a as api } from "./router-Cfo28kxB.js";
import { A as AppHeader } from "./AppHeader-CUBh8qk8.js";
import { B as Button, C as Card, a as CardContent, b as CardHeader, d as CardTitle, e as CardDescription } from "./card-DskBQYqB.js";
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
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto min-h-screen w-full max-w-5xl space-y-6 p-4", children: [
    /* @__PURE__ */ jsx(AppHeader, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-xl font-semibold", children: [
        /* @__PURE__ */ jsx(Truck, { size: 20 }),
        " Configured routes"
      ] }),
      /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/routes/new", children: [
        /* @__PURE__ */ jsx(Plus, { size: 16 }),
        " New route"
      ] }) })
    ] }),
    routes.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-10 text-center text-muted-foreground", children: "No routes configured yet. Create your first route to start tracking." }) }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: routes.map((route) => /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            route.name,
            !route.isActive && /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "inactive" })
          ] }),
          /* @__PURE__ */ jsxs(CardDescription, { children: [
            "Vehicle ",
            route.vehicleRegistration,
            " · ",
            route.stops.length,
            " ",
            "drop point(s)",
            route.activeStartMinutes != null && route.activeEndMinutes != null && /* @__PURE__ */ jsxs(Fragment, { children: [
              " ",
              "· ",
              minutesToLabel(route.activeStartMinutes),
              "–",
              minutesToLabel(route.activeEndMinutes)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/routes/$routeId", params: {
            routeId: route._id
          }, children: /* @__PURE__ */ jsx(Pencil, { size: 16 }) }) }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "text-muted-foreground hover:text-red-500", onClick: async () => {
            if (!confirm(`Delete route "${route.name}"?`)) return;
            await remove({
              id: route._id
            });
            toast.success("Route deleted");
          }, children: /* @__PURE__ */ jsx(Trash2, { size: 16 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("ul", { className: "space-y-1 text-sm", children: route.stops.map((stop) => /* @__PURE__ */ jsxs("li", { className: "flex justify-between text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            stop.order + 1,
            ". ",
            stop.name
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            stop.radiusMeters ?? 100,
            " m"
          ] })
        ] }, stop._id)) }),
        /* @__PURE__ */ jsx(Button, { variant: "link", size: "sm", className: "px-0", onClick: () => setActive({
          id: route._id,
          isActive: !route.isActive
        }), children: route.isActive ? "Deactivate" : "Activate" })
      ] })
    ] }, route._id)) }),
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
export {
  RoutesList as component
};
