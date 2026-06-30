import { jsxs, jsx } from "react/jsx-runtime";
import { Toaster } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { R as Route, a as api } from "./router-u7K94VBP.js";
import { A as AppHeader } from "./AppHeader-CCbNP1ol.js";
import { R as RouteForm } from "./RouteForm-Bk0e-Okn.js";
import "@tanstack/react-router";
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
import "lucide-react";
import "./card-CmruOdWT.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "./label-BtOcBn8z.js";
import "@radix-ui/react-label";
function EditRoute() {
  const {
    routeId
  } = Route.useParams();
  const {
    data: route
  } = useSuspenseQuery(convexQuery(api.routes.get, {
    id: routeId
  }));
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto min-h-screen w-full max-w-3xl space-y-6 p-4", children: [
    /* @__PURE__ */ jsx(AppHeader, {}),
    /* @__PURE__ */ jsx(RouteForm, { initial: {
      id: route._id,
      name: route.name,
      vehicleRegistration: route.vehicleRegistration,
      activeStartMinutes: route.activeStartMinutes,
      activeEndMinutes: route.activeEndMinutes,
      stops: route.stops.map((s) => ({
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        radiusMeters: s.radiusMeters
      }))
    } }),
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
export {
  EditRoute as component
};
