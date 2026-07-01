/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as email from "../email.js";
import type * as emails_components_BaseEmail from "../emails/components/BaseEmail.js";
import type * as emails_magicLink from "../emails/magicLink.js";
import type * as emails_resetPassword from "../emails/resetPassword.js";
import type * as emails_verifyEmail from "../emails/verifyEmail.js";
import type * as emails_verifyOTP from "../emails/verifyOTP.js";
import type * as http from "../http.js";
import type * as invoices from "../invoices.js";
import type * as lib_geo from "../lib/geo.js";
import type * as lib_iot from "../lib/iot.js";
import type * as lib_osrm from "../lib/osrm.js";
import type * as lib_time from "../lib/time.js";
import type * as monitoring from "../monitoring.js";
import type * as routes from "../routes.js";
import type * as routing from "../routing.js";
import type * as todos from "../todos.js";
import type * as vehicles from "../vehicles.js";
import type * as visits from "../visits.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  email: typeof email;
  "emails/components/BaseEmail": typeof emails_components_BaseEmail;
  "emails/magicLink": typeof emails_magicLink;
  "emails/resetPassword": typeof emails_resetPassword;
  "emails/verifyEmail": typeof emails_verifyEmail;
  "emails/verifyOTP": typeof emails_verifyOTP;
  http: typeof http;
  invoices: typeof invoices;
  "lib/geo": typeof lib_geo;
  "lib/iot": typeof lib_iot;
  "lib/osrm": typeof lib_osrm;
  "lib/time": typeof lib_time;
  monitoring: typeof monitoring;
  routes: typeof routes;
  routing: typeof routing;
  todos: typeof todos;
  vehicles: typeof vehicles;
  visits: typeof visits;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
};
