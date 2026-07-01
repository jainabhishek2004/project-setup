import { stripIndent } from "common-tags";
import { ConvexHttpClient } from "convex/browser";
import { betterFetch } from "@better-fetch/fetch";
import "@better-auth/utils/base64";
import "@better-auth/utils/binary";
import "@better-auth/utils/hmac";
import "convex-helpers";
import * as jose from "jose";
import React__default from "react";
function tryDecode(str) {
  if (str.indexOf("%") === -1) return str;
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}
const cookieNameRegex = /^[\x21\x23-\x27\x2A\x2B\x2D\x2E\x30-\x39\x41-\x5A\x5E\x5F\x60\x61-\x7A\x7C\x7E]+$/;
const cookieValueRegex = /^[\x20\x21\x23-\x3A\x3C-\x5B\x5D-\x7E]*$/;
function unquoteCookieValue(value) {
  if (value.length < 2 || !value.startsWith('"') || !value.endsWith('"')) return value;
  return value.slice(1, -1);
}
function trimOWS(s) {
  let start = 0;
  let end = s.length;
  while (start < end) {
    const c = s.charCodeAt(start);
    if (c !== 32 && c !== 9) break;
    start++;
  }
  while (end > start) {
    const c = s.charCodeAt(end - 1);
    if (c !== 32 && c !== 9) break;
    end--;
  }
  return start === 0 && end === s.length ? s : s.slice(start, end);
}
function parseCookies(cookie) {
  const cookieMap = /* @__PURE__ */ new Map();
  if (cookie.length < 2) return cookieMap;
  for (const chunk of cookie.split(";")) {
    const eq = chunk.indexOf("=");
    if (eq === -1) continue;
    const key = trimOWS(chunk.slice(0, eq));
    const val = unquoteCookieValue(trimOWS(chunk.slice(eq + 1)));
    if (cookieNameRegex.test(key) && cookieValueRegex.test(val)) cookieMap.set(key, tryDecode(val));
  }
  return cookieMap;
}
const getSessionCookie = (request, config) => {
  const cookies = (request instanceof Headers || !("headers" in request) ? request : request.headers).get("cookie");
  if (!cookies) return null;
  const { cookieName = "session_token", cookiePrefix = "better-auth" } = config || {};
  const parsedCookie = parseCookies(cookies);
  const getCookie = (name) => parsedCookie.get(`__Secure-${name}`) ?? parsedCookie.get(name);
  const sessionToken = getCookie(`${cookiePrefix}.${cookieName}`) || getCookie(`${cookiePrefix}-${cookieName}`);
  if (sessionToken) return sessionToken;
  return null;
};
const JWT_COOKIE_NAME = "convex_jwt";
const getToken$1 = async (siteUrl, headers, opts) => {
  headers.set("host", new URL(siteUrl).host);
  const fetchToken = async () => {
    const basePath = opts?.basePath ? (opts.basePath.startsWith("/") ? opts.basePath : `/${opts.basePath}`).replace(/\/+$/, "") : "/api/auth";
    const { data } = await betterFetch(`${basePath}/convex/token`, {
      baseURL: siteUrl,
      headers
    });
    return { isFresh: true, token: data?.token };
  };
  if (!opts?.jwtCache?.enabled || opts.forceRefresh) {
    return await fetchToken();
  }
  const token = getSessionCookie(new Headers(headers), {
    cookieName: JWT_COOKIE_NAME,
    cookiePrefix: opts?.cookiePrefix
  });
  if (!token) {
    return await fetchToken();
  }
  try {
    const claims = jose.decodeJwt(token);
    const exp = claims?.exp;
    const now = Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3);
    const isExpired = exp ? now > exp + (opts?.jwtCache?.expirationToleranceSeconds ?? 60) : true;
    if (!isExpired) {
      return { isFresh: false, token };
    }
  } catch (error) {
    console.error("Error decoding JWT", error);
  }
  return await fetchToken();
};
const cache = React__default.cache || ((fn) => {
  return (...args) => fn(...args);
});
function setupClient(options) {
  const client = new ConvexHttpClient(options.convexUrl);
  if (options.token !== void 0) {
    client.setAuth(options.token);
  }
  client.setFetchOptions({ cache: "no-store" });
  return client;
}
const parseConvexSiteUrl = (url) => {
  if (!url) {
    throw new Error(stripIndent`
      CONVEX_SITE_URL is not set.
      This is automatically set in the Convex backend, but must be set in the TanStack Start environment.
      For local development, this can be set in the .env.local file.
    `);
  }
  if (url.endsWith(".convex.cloud")) {
    throw new Error(stripIndent`
      CONVEX_SITE_URL should be set to your Convex Site URL, which ends in .convex.site.
      Currently set to ${url}.
    `);
  }
  return url;
};
const handler$1 = (request, opts) => {
  const requestUrl = new URL(request.url);
  const nextUrl = `${opts.convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
  const headers = new Headers(request.headers);
  headers.delete("transfer-encoding");
  headers.delete("content-length");
  headers.delete("connection");
  headers.set("accept-encoding", "application/json");
  headers.set("host", new URL(opts.convexSiteUrl).host);
  headers.set("x-forwarded-host", requestUrl.host);
  headers.set("x-forwarded-proto", requestUrl.protocol.replace(/:$/, ""));
  headers.set("x-better-auth-forwarded-host", requestUrl.host);
  headers.set("x-better-auth-forwarded-proto", requestUrl.protocol.replace(/:$/, ""));
  return fetch(nextUrl, {
    method: request.method,
    headers,
    redirect: "manual",
    body: request.body,
    // @ts-expect-error - duplex is required for streaming request bodies in modern fetch
    duplex: "half"
  });
};
const convexBetterAuthReactStart = (opts) => {
  const siteUrl = parseConvexSiteUrl(opts.convexSiteUrl);
  const cachedGetToken = cache(async (opts2) => {
    const { getRequestHeaders } = await import("./server-COqJ5EMS.js");
    const headers = getRequestHeaders();
    const mutableHeaders = new Headers(headers);
    mutableHeaders.delete("content-length");
    mutableHeaders.delete("transfer-encoding");
    mutableHeaders.set("accept-encoding", "identity");
    return getToken$1(siteUrl, mutableHeaders, opts2);
  });
  const callWithToken = async (fn) => {
    const token = await cachedGetToken(opts) ?? {};
    try {
      return await fn(token?.token);
    } catch (error) {
      if (!opts?.jwtCache?.enabled || token.isFresh || opts.jwtCache?.isAuthError(error)) {
        throw error;
      }
      const newToken = await cachedGetToken({
        ...opts,
        forceRefresh: true
      });
      return await fn(newToken.token);
    }
  };
  return {
    getToken: async () => {
      const token = await cachedGetToken(opts);
      return token.token;
    },
    handler: (request) => handler$1(request, opts),
    fetchAuthQuery: async (query, ...args) => {
      return callWithToken((token) => {
        const client = setupClient({ ...opts, token });
        return client.query(query, ...args);
      });
    },
    fetchAuthMutation: async (mutation, ...args) => {
      return callWithToken((token) => {
        const client = setupClient({ ...opts, token });
        return client.mutation(mutation, ...args);
      });
    },
    fetchAuthAction: async (action, ...args) => {
      return callWithToken((token) => {
        const client = setupClient({ ...opts, token });
        return client.action(action, ...args);
      });
    }
  };
};
const {
  handler,
  getToken
} = convexBetterAuthReactStart({
  convexUrl: process.env.VITE_CONVEX_URL,
  convexSiteUrl: process.env.VITE_CONVEX_SITE_URL
});
export {
  getToken as g,
  handler as h
};
