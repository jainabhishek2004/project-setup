import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, Suspense, lazy } from "react";
import { Toaster } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { b as Route, a as api } from "./router-BY3u6Q8c.js";
import { A as AppHeader } from "./AppHeader-DqvummcP.js";
import { B as Button } from "./button-Cm5QyDGI.js";
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
const RouteMap = lazy(() => import("./RouteMap-CygjvP4H.js").then((m) => ({
  default: m.RouteMap
})));
function MapPage() {
  const {
    dailyRouteId
  } = Route.useParams();
  const {
    data
  } = useSuspenseQuery(convexQuery(api.dailyRoutes.getDailyRoute, {
    id: dailyRouteId
  }));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const mapFallback = /* @__PURE__ */ jsx("div", { className: "flex h-[72vh] items-center justify-center rounded-lg border", children: /* @__PURE__ */ jsx(Loader2, { className: "text-muted-foreground size-6 animate-spin" }) });
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto min-h-screen w-full max-w-6xl space-y-4 p-4", children: [
    /* @__PURE__ */ jsx(AppHeader, {}),
    /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", asChild: true, className: "-ml-2 w-fit", children: /* @__PURE__ */ jsxs(Link, { to: "/", children: [
      /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }),
      " Back to dashboard"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: data.routeName }),
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-sm", children: [
        "Drop points and live location for ",
        data.vehicleRegistration
      ] })
    ] }),
    mounted ? /* @__PURE__ */ jsx(Suspense, { fallback: mapFallback, children: /* @__PURE__ */ jsx(RouteMap, { vehicleRegistration: data.vehicleRegistration, stops: data.stops, mapClassName: "h-[72vh]" }) }) : mapFallback,
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
export {
  MapPage as component
};
