import { T as TSS_SERVER_FUNCTION, b as createServerFn } from "../server.js";
import { g as getToken } from "./auth-server-OeSBPYOe.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "common-tags";
import "convex/browser";
import "@better-fetch/fetch";
import "@better-auth/utils/base64";
import "@better-auth/utils/binary";
import "@better-auth/utils/hmac";
import "convex-helpers";
import "jose";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const getAuth_createServerFn_handler = createServerRpc({
  id: "cb2b3e5e1e8306e053224009604ac2548a745898344521b332eb26227a28d58b",
  name: "getAuth",
  filename: "src/routes/__root.tsx"
}, (opts) => getAuth.__executeServer(opts));
const getAuth = createServerFn({
  method: "GET"
}).handler(getAuth_createServerFn_handler, async () => {
  return await getToken();
});
export {
  getAuth_createServerFn_handler
};
