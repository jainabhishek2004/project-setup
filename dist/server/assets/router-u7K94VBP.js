import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { createRootRouteWithContext, useRouteContext, Outlet, HeadContent, Scripts, createFileRoute, redirect, lazyRouteComponent, useRouter, useMatch, rootRouteId, ErrorComponent, Link, createRouter } from "@tanstack/react-router";
import { notifyManager, QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { convexQuery, ConvexQueryClient } from "@convex-dev/react-query";
import { T as TSS_SERVER_FUNCTION, e as getServerFnById, b as createServerFn } from "../server.js";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState, useRef, useMemo, useCallback, useSyncExternalStore } from "react";
import { ConvexProviderWithAuth } from "convex/react";
import { defineErrorCodes } from "@better-auth/core/utils/error-codes";
import { env } from "@better-auth/core/env";
import { BetterAuthError } from "@better-auth/core/error";
import { isSafeUrlScheme } from "@better-auth/core/utils/url";
import { atom, onMount, listenKeys } from "nanostores";
import { defu } from "defu";
import { createFetch } from "@better-fetch/fetch";
import { toKebabCase, capitalizeFirstLetter } from "@better-auth/core/utils/string";
import { anyApi, componentsGeneric } from "convex/server";
import { h as handler } from "./auth-server-OeSBPYOe.js";
const SLASH_CHAR_CODE = "/".charCodeAt(0);
function trimTrailingSlashes(value) {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === SLASH_CHAR_CODE) end--;
  return end === value.length ? value : value.slice(0, end);
}
function checkHasPath(url) {
  try {
    return (trimTrailingSlashes(new URL(url).pathname) || "/") !== "/";
  } catch {
    throw new BetterAuthError(`Invalid base URL: ${url}. Please provide a valid base URL.`);
  }
}
function assertHasProtocol(url) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") throw new BetterAuthError(`Invalid base URL: ${url}. URL must include 'http://' or 'https://'`);
  } catch (error) {
    if (error instanceof BetterAuthError) throw error;
    throw new BetterAuthError(`Invalid base URL: ${url}. Please provide a valid base URL.`, { cause: error });
  }
}
function withPath(url, path = "/api/auth") {
  assertHasProtocol(url);
  if (checkHasPath(url)) return url;
  const trimmedUrl = trimTrailingSlashes(url);
  if (!path || path === "/") return trimmedUrl;
  path = path.startsWith("/") ? path : `/${path}`;
  return `${trimmedUrl}${path}`;
}
function getBaseURL(url, path, request, loadEnv, trustedProxyHeaders) {
  if (url) return withPath(url, path);
  {
    const fromEnv = env.BETTER_AUTH_URL || env.NEXT_PUBLIC_BETTER_AUTH_URL || env.PUBLIC_BETTER_AUTH_URL || env.NUXT_PUBLIC_BETTER_AUTH_URL || env.NUXT_PUBLIC_AUTH_URL || (env.BASE_URL !== "/" ? env.BASE_URL : void 0);
    if (fromEnv) return withPath(fromEnv, path);
  }
  if (typeof window !== "undefined" && window.location) return withPath(window.location.origin, path);
}
var version = "1.6.15";
const PACKAGE_VERSION = version;
const VERSION = "0.12.4";
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const appCss = "/assets/app-5KjjeUbr.css";
function ConvexBetterAuthProvider({ children, client, authClient: authClient2, initialToken }) {
  const useBetterAuth = useUseAuthFromBetterAuth(authClient2, initialToken);
  useEffect(() => {
    (async () => {
      if (typeof window === "undefined" || !window.location?.href) {
        return;
      }
      const url = new URL(window.location.href);
      const token = url.searchParams.get("ott");
      if (token) {
        const authClientWithCrossDomain = authClient2;
        url.searchParams.delete("ott");
        window.history.replaceState({}, "", url);
        const result = await authClientWithCrossDomain.crossDomain.oneTimeToken.verify({
          token
        });
        const session = result.data?.session;
        if (session) {
          await authClient2.getSession({
            fetchOptions: {
              headers: {
                Authorization: `Bearer ${session.token}`
              }
            }
          });
          authClientWithCrossDomain.updateSession();
        }
      }
    })();
  }, [authClient2]);
  return jsx(ConvexProviderWithAuth, { client, useAuth: useBetterAuth, children: jsx(Fragment, { children }) });
}
let initialTokenUsed = false;
function useUseAuthFromBetterAuth(authClient2, initialToken) {
  const [cachedToken, setCachedToken] = useState(initialTokenUsed ? null : initialToken ?? null);
  const pendingTokenRef = useRef(null);
  useEffect(() => {
    if (!initialTokenUsed) {
      initialTokenUsed = true;
    }
  }, []);
  return useMemo(() => function useAuthFromBetterAuth() {
    const { data: session, isPending: isSessionPending } = authClient2.useSession();
    const sessionId = session?.session?.id;
    useEffect(() => {
      if (!session && !isSessionPending && cachedToken) {
        setCachedToken(null);
      }
    }, [session, isSessionPending]);
    const fetchAccessToken = useCallback(
      async ({ forceRefreshToken = false } = {}) => {
        if (cachedToken && !forceRefreshToken) {
          return cachedToken;
        }
        if (!forceRefreshToken && pendingTokenRef.current) {
          return pendingTokenRef.current;
        }
        pendingTokenRef.current = authClient2.convex.token({ fetchOptions: { throw: false } }).then(({ data }) => {
          const token = data?.token || null;
          setCachedToken(token);
          return token;
        }).catch(() => {
          setCachedToken(null);
          return null;
        }).finally(() => {
          pendingTokenRef.current = null;
        });
        return pendingTokenRef.current;
      },
      // Build a new fetchAccessToken to trigger setAuth() whenever the
      // session changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [sessionId]
    );
    return useMemo(
      () => ({
        isLoading: isSessionPending && !cachedToken,
        isAuthenticated: Boolean(session?.session) || cachedToken !== null,
        fetchAccessToken
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [isSessionPending, sessionId, fetchAccessToken, cachedToken]
    );
  }, [authClient2]);
}
const ANONYMOUS_ERROR_CODES = defineErrorCodes({
  INVALID_EMAIL_FORMAT: "Email was not generated in a valid format",
  FAILED_TO_CREATE_USER: "Failed to create user",
  COULD_NOT_CREATE_SESSION: "Could not create session",
  ANONYMOUS_USERS_CANNOT_SIGN_IN_AGAIN_ANONYMOUSLY: "Anonymous users cannot sign in again anonymously",
  FAILED_TO_DELETE_ANONYMOUS_USER: "Failed to delete anonymous user",
  FAILED_TO_DELETE_ANONYMOUS_USER_SESSIONS: "Failed to delete anonymous user sessions",
  USER_IS_NOT_ANONYMOUS: "User is not anonymous",
  DELETE_ANONYMOUS_USER_DISABLED: "Deleting anonymous users is disabled"
});
const anonymousClient = () => {
  return {
    id: "anonymous",
    version: PACKAGE_VERSION,
    $InferServerPlugin: {},
    pathMethods: {
      "/sign-in/anonymous": "POST",
      "/delete-anonymous-user": "POST"
    },
    atomListeners: [{
      matcher: (path) => path === "/sign-in/anonymous",
      signal: "$sessionSignal"
    }],
    $ERROR_CODES: ANONYMOUS_ERROR_CODES
  };
};
const EMAIL_OTP_ERROR_CODES = defineErrorCodes({
  OTP_EXPIRED: "OTP expired",
  INVALID_OTP: "Invalid OTP",
  TOO_MANY_ATTEMPTS: "Too many attempts"
});
const emailOTPClient = () => {
  return {
    id: "email-otp",
    version: PACKAGE_VERSION,
    $InferServerPlugin: {},
    atomListeners: [{
      matcher: (path) => path === "/email-otp/verify-email" || path === "/sign-in/email-otp" || path === "/email-otp/request-email-change",
      signal: "$sessionSignal"
    }],
    $ERROR_CODES: EMAIL_OTP_ERROR_CODES
  };
};
const magicLinkClient = () => {
  return {
    id: "magic-link",
    version: PACKAGE_VERSION,
    $InferServerPlugin: {}
  };
};
const isServer = () => typeof window === "undefined";
const useAuthQuery = (initializedAtom, path, $fetch, options) => {
  const value = atom({
    data: null,
    error: null,
    isPending: true,
    isRefetching: false,
    refetch: (queryParams) => fn(queryParams)
  });
  const fn = async (queryParams) => {
    return new Promise((resolve) => {
      const opts = typeof options === "function" ? options({
        data: value.get().data,
        error: value.get().error,
        isPending: value.get().isPending
      }) : options;
      $fetch(path, {
        ...opts,
        query: {
          ...opts?.query,
          ...queryParams?.query
        },
        async onSuccess(context) {
          value.set({
            data: context.data,
            error: null,
            isPending: false,
            isRefetching: false,
            refetch: value.value.refetch
          });
          await opts?.onSuccess?.(context);
        },
        async onError(context) {
          const { request } = context;
          const retryAttempts = typeof request.retry === "number" ? request.retry : request.retry?.attempts;
          const retryAttempt = request.retryAttempt || 0;
          if (retryAttempts && retryAttempt < retryAttempts) return;
          const isUnauthorized = context.error.status === 401;
          value.set({
            error: context.error,
            data: isUnauthorized ? null : value.get().data,
            isPending: false,
            isRefetching: false,
            refetch: value.value.refetch
          });
          await opts?.onError?.(context);
        },
        async onRequest(context) {
          const currentValue = value.get();
          value.set({
            isPending: currentValue.data === null,
            data: currentValue.data,
            error: null,
            isRefetching: true,
            refetch: value.value.refetch
          });
          await opts?.onRequest?.(context);
        }
      }).catch((error) => {
        value.set({
          error,
          data: value.get().data,
          isPending: false,
          isRefetching: false,
          refetch: value.value.refetch
        });
      }).finally(() => {
        resolve(void 0);
      });
    });
  };
  initializedAtom = Array.isArray(initializedAtom) ? initializedAtom : [initializedAtom];
  let isInitialized = false;
  for (const initAtom of initializedAtom) initAtom.subscribe(async () => {
    if (isServer()) return;
    if (isInitialized) await fn();
    else onMount(value, () => {
      const timeoutId = setTimeout(async () => {
        if (!isInitialized) {
          isInitialized = true;
          await fn();
        }
      }, 0);
      return () => {
        value.off();
        initAtom.off();
        clearTimeout(timeoutId);
      };
    });
  });
  return value;
};
const TWO_FACTOR_ERROR_CODES = defineErrorCodes({
  OTP_NOT_ENABLED: "OTP not enabled",
  OTP_HAS_EXPIRED: "OTP has expired",
  TOTP_NOT_ENABLED: "TOTP not enabled",
  TWO_FACTOR_NOT_ENABLED: "Two factor isn't enabled",
  BACKUP_CODES_NOT_ENABLED: "Backup codes aren't enabled",
  INVALID_BACKUP_CODE: "Invalid backup code",
  INVALID_CODE: "Invalid code",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "Too many attempts. Please request a new code.",
  INVALID_TWO_FACTOR_COOKIE: "Invalid two factor cookie"
});
const twoFactorClient = (options) => {
  return {
    id: "two-factor",
    version: PACKAGE_VERSION,
    $InferServerPlugin: {},
    atomListeners: [{
      matcher: (path) => path.startsWith("/two-factor/"),
      signal: "$sessionSignal"
    }],
    pathMethods: {
      "/two-factor/disable": "POST",
      "/two-factor/enable": "POST",
      "/two-factor/send-otp": "POST",
      "/two-factor/generate-backup-codes": "POST",
      "/two-factor/get-totp-uri": "POST",
      "/two-factor/verify-totp": "POST",
      "/two-factor/verify-otp": "POST",
      "/two-factor/verify-backup-code": "POST"
    },
    fetchPlugins: [{
      id: "two-factor",
      name: "two-factor",
      hooks: { async onSuccess(context) {
        if (context.data?.twoFactorRedirect) ;
      } }
    }],
    $ERROR_CODES: TWO_FACTOR_ERROR_CODES
  };
};
const PROTO_POLLUTION_PATTERNS = {
  proto: /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/,
  constructor: /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/,
  protoShort: /"__proto__"\s*:/,
  constructorShort: /"constructor"\s*:/
};
const JSON_SIGNATURE = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
const SPECIAL_VALUES = {
  true: true,
  false: false,
  null: null,
  undefined: void 0,
  nan: NaN,
  infinity: Number.POSITIVE_INFINITY,
  "-infinity": Number.NEGATIVE_INFINITY
};
const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,7}))?(?:Z|([+-])(\d{2}):(\d{2}))$/;
function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}
function parseISODate(value) {
  const match = ISO_DATE_REGEX.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute, second, ms, offsetSign, offsetHour, offsetMinute] = match;
  const date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10), ms ? parseInt(ms.padEnd(3, "0"), 10) : 0));
  if (offsetSign) {
    const offset = (parseInt(offsetHour, 10) * 60 + parseInt(offsetMinute, 10)) * (offsetSign === "+" ? -1 : 1);
    date.setUTCMinutes(date.getUTCMinutes() + offset);
  }
  return isValidDate(date) ? date : null;
}
function betterJSONParse(value, options = {}) {
  const { strict = false, warnings = false, reviver, parseDates = true } = options;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  const lowerValue = trimmed.toLowerCase();
  if (lowerValue.length <= 9 && lowerValue in SPECIAL_VALUES) return SPECIAL_VALUES[lowerValue];
  if (!JSON_SIGNATURE.test(trimmed)) {
    if (strict) throw new SyntaxError("[better-json] Invalid JSON");
    return value;
  }
  if (Object.entries(PROTO_POLLUTION_PATTERNS).some(([key, pattern]) => {
    const matches = pattern.test(trimmed);
    if (matches && warnings) console.warn(`[better-json] Detected potential prototype pollution attempt using ${key} pattern`);
    return matches;
  }) && strict) throw new Error("[better-json] Potential prototype pollution attempt detected");
  try {
    const secureReviver = (key, value2) => {
      if (key === "__proto__" || key === "constructor" && value2 && typeof value2 === "object" && "prototype" in value2) {
        if (warnings) console.warn(`[better-json] Dropping "${key}" key to prevent prototype pollution`);
        return;
      }
      if (parseDates && typeof value2 === "string") {
        const date = parseISODate(value2);
        if (date) return date;
      }
      return reviver ? reviver(key, value2) : value2;
    };
    return JSON.parse(trimmed, secureReviver);
  } catch (error) {
    if (strict) throw error;
    return value;
  }
}
function parseJSON(value, options = { strict: true }) {
  return betterJSONParse(value, options);
}
const redirectPlugin = {
  id: "redirect",
  name: "Redirect",
  hooks: { onSuccess(context) {
    if (context.data?.url && context.data?.redirect && isSafeUrlScheme(context.data.url)) {
      if (typeof window !== "undefined" && window.location) {
        if (window.location) try {
          window.location.href = context.data.url;
        } catch {
        }
      }
    }
  } }
};
const kBroadcastChannel = Symbol.for("better-auth:broadcast-channel");
const now$1 = () => Math.floor(Date.now() / 1e3);
var WindowBroadcastChannel = class {
  listeners = /* @__PURE__ */ new Set();
  name;
  constructor(name = "better-auth.message") {
    this.name = name;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  post(message) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.name, JSON.stringify({
        ...message,
        timestamp: now$1()
      }));
    } catch {
    }
  }
  setup() {
    if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return () => {
    };
    const handler2 = (event) => {
      if (event.key !== this.name) return;
      const message = JSON.parse(event.newValue ?? "{}");
      if (message?.event !== "session" || !message?.data) return;
      this.listeners.forEach((listener) => listener(message));
    };
    window.addEventListener("storage", handler2);
    return () => {
      window.removeEventListener("storage", handler2);
    };
  }
};
function getGlobalBroadcastChannel(name = "better-auth.message") {
  if (!globalThis[kBroadcastChannel]) globalThis[kBroadcastChannel] = new WindowBroadcastChannel(name);
  return globalThis[kBroadcastChannel];
}
const kFocusManager = Symbol.for("better-auth:focus-manager");
var WindowFocusManager = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  setFocused(focused) {
    this.listeners.forEach((listener) => listener(focused));
  }
  setup() {
    if (typeof window === "undefined" || typeof document === "undefined" || typeof window.addEventListener === "undefined") return () => {
    };
    const visibilityHandler = () => {
      if (document.visibilityState === "visible") this.setFocused(true);
    };
    document.addEventListener("visibilitychange", visibilityHandler, false);
    return () => {
      document.removeEventListener("visibilitychange", visibilityHandler, false);
    };
  }
};
function getGlobalFocusManager() {
  if (!globalThis[kFocusManager]) globalThis[kFocusManager] = new WindowFocusManager();
  return globalThis[kFocusManager];
}
const kOnlineManager = Symbol.for("better-auth:online-manager");
var WindowOnlineManager = class {
  listeners = /* @__PURE__ */ new Set();
  isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  setOnline(online) {
    this.isOnline = online;
    this.listeners.forEach((listener) => listener(online));
  }
  setup() {
    if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return () => {
    };
    const onOnline = () => this.setOnline(true);
    const onOffline = () => this.setOnline(false);
    window.addEventListener("online", onOnline, false);
    window.addEventListener("offline", onOffline, false);
    return () => {
      window.removeEventListener("online", onOnline, false);
      window.removeEventListener("offline", onOffline, false);
    };
  }
};
function getGlobalOnlineManager() {
  if (!globalThis[kOnlineManager]) globalThis[kOnlineManager] = new WindowOnlineManager();
  return globalThis[kOnlineManager];
}
const now = () => Math.floor(Date.now() / 1e3);
function normalizeSessionResponse(res) {
  if (typeof res === "object" && res !== null && "data" in res && "error" in res) return res;
  return {
    data: res,
    error: null
  };
}
const FOCUS_REFETCH_RATE_LIMIT_SECONDS = 5;
function createSessionRefreshManager(opts) {
  const { sessionAtom, sessionSignal, $fetch, options = {} } = opts;
  const refetchInterval = options.sessionOptions?.refetchInterval ?? 0;
  const refetchOnWindowFocus = options.sessionOptions?.refetchOnWindowFocus ?? true;
  const refetchWhenOffline = options.sessionOptions?.refetchWhenOffline ?? false;
  const state = {
    lastSync: 0,
    lastSessionRequest: 0,
    cachedSession: void 0
  };
  const shouldRefetch = () => {
    return refetchWhenOffline || getGlobalOnlineManager().isOnline;
  };
  const triggerRefetch = (event) => {
    if (!shouldRefetch()) return;
    if (event?.event === "storage") {
      state.lastSync = now();
      sessionSignal.set(!sessionSignal.get());
      return;
    }
    const currentSession = sessionAtom.get();
    const fetchSessionWithRefresh = () => {
      state.lastSessionRequest = now();
      $fetch("/get-session").then(async (res) => {
        let { data, error } = normalizeSessionResponse(res);
        if (data?.needsRefresh) try {
          const refreshRes = await $fetch("/get-session", { method: "POST" });
          ({ data, error } = normalizeSessionResponse(refreshRes));
        } catch {
        }
        const sessionData = data?.session && data?.user ? data : null;
        sessionAtom.set({
          ...currentSession,
          data: sessionData,
          error
        });
        state.lastSync = now();
        sessionSignal.set(!sessionSignal.get());
      }).catch(() => {
      });
    };
    if (event?.event === "poll") {
      fetchSessionWithRefresh();
      return;
    }
    if (event?.event === "visibilitychange") {
      if (now() - state.lastSessionRequest < FOCUS_REFETCH_RATE_LIMIT_SECONDS) return;
      state.lastSessionRequest = now();
    }
    if (event?.event === "visibilitychange") {
      fetchSessionWithRefresh();
      return;
    }
    if (currentSession?.data === null || currentSession?.data === void 0) {
      state.lastSync = now();
      sessionSignal.set(!sessionSignal.get());
    }
  };
  const broadcastSessionUpdate = (trigger) => {
    getGlobalBroadcastChannel().post({
      event: "session",
      data: { trigger },
      clientId: Math.random().toString(36).substring(7)
    });
  };
  const setupPolling = () => {
    if (refetchInterval && refetchInterval > 0) state.pollInterval = setInterval(() => {
      if (sessionAtom.get()?.data) triggerRefetch({ event: "poll" });
    }, refetchInterval * 1e3);
  };
  const setupBroadcast = () => {
    state.unsubscribeBroadcast = getGlobalBroadcastChannel().subscribe(() => {
      triggerRefetch({ event: "storage" });
    });
  };
  const setupFocusRefetch = () => {
    if (!refetchOnWindowFocus) return;
    state.unsubscribeFocus = getGlobalFocusManager().subscribe(() => {
      triggerRefetch({ event: "visibilitychange" });
    });
  };
  const setupOnlineRefetch = () => {
    state.unsubscribeOnline = getGlobalOnlineManager().subscribe((online) => {
      if (online) triggerRefetch({ event: "visibilitychange" });
    });
  };
  const init = () => {
    setupPolling();
    setupBroadcast();
    setupFocusRefetch();
    setupOnlineRefetch();
    getGlobalBroadcastChannel().setup();
    getGlobalFocusManager().setup();
    getGlobalOnlineManager().setup();
  };
  const cleanup = () => {
    if (state.pollInterval) {
      clearInterval(state.pollInterval);
      state.pollInterval = void 0;
    }
    if (state.unsubscribeBroadcast) {
      state.unsubscribeBroadcast();
      state.unsubscribeBroadcast = void 0;
    }
    if (state.unsubscribeFocus) {
      state.unsubscribeFocus();
      state.unsubscribeFocus = void 0;
    }
    if (state.unsubscribeOnline) {
      state.unsubscribeOnline();
      state.unsubscribeOnline = void 0;
    }
    state.lastSync = 0;
    state.lastSessionRequest = 0;
    state.cachedSession = void 0;
  };
  return {
    init,
    cleanup,
    triggerRefetch,
    broadcastSessionUpdate
  };
}
function getSessionAtom($fetch, options) {
  const $signal = atom(false);
  const session = useAuthQuery($signal, "/get-session", $fetch, { method: "GET" });
  let broadcastSessionUpdate = () => {
  };
  onMount(session, () => {
    const refreshManager = createSessionRefreshManager({
      sessionAtom: session,
      sessionSignal: $signal,
      $fetch,
      options
    });
    refreshManager.init();
    broadcastSessionUpdate = refreshManager.broadcastSessionUpdate;
    return () => {
      refreshManager.cleanup();
    };
  });
  return {
    session,
    $sessionSignal: $signal,
    broadcastSessionUpdate: (trigger) => broadcastSessionUpdate(trigger)
  };
}
const resolvePublicAuthUrl = (basePath) => {
  if (typeof process === "undefined") return void 0;
  const path = basePath ?? "/api/auth";
  if (process.env.NEXT_PUBLIC_AUTH_URL) return process.env.NEXT_PUBLIC_AUTH_URL;
  if (typeof window === "undefined") {
    if (process.env.NEXTAUTH_URL) try {
      return process.env.NEXTAUTH_URL;
    } catch {
    }
    if (process.env.VERCEL_URL) try {
      const protocol = process.env.VERCEL_URL.startsWith("http") ? "" : "https://";
      return `${new URL(`${protocol}${process.env.VERCEL_URL}`).origin}${path}`;
    } catch {
    }
  }
};
const getClientConfig = (options, loadEnv) => {
  const isCredentialsSupported = "credentials" in Request.prototype;
  const baseURL = getBaseURL(options?.baseURL, options?.basePath) ?? resolvePublicAuthUrl(options?.basePath) ?? "/api/auth";
  const pluginsFetchPlugins = options?.plugins?.flatMap((plugin) => plugin.fetchPlugins).filter((pl) => pl !== void 0) || [];
  const lifeCyclePlugin = {
    id: "lifecycle-hooks",
    name: "lifecycle-hooks",
    hooks: {
      onSuccess: options?.fetchOptions?.onSuccess,
      onError: options?.fetchOptions?.onError,
      onRequest: options?.fetchOptions?.onRequest,
      onResponse: options?.fetchOptions?.onResponse
    }
  };
  const { onSuccess: _onSuccess, onError: _onError, onRequest: _onRequest, onResponse: _onResponse, ...restOfFetchOptions } = options?.fetchOptions || {};
  const $fetch = createFetch({
    baseURL,
    ...isCredentialsSupported ? { credentials: "include" } : {},
    method: "GET",
    jsonParser(text) {
      if (!text) return null;
      return parseJSON(text, { strict: false });
    },
    customFetchImpl: fetch,
    ...restOfFetchOptions,
    plugins: [
      lifeCyclePlugin,
      ...restOfFetchOptions.plugins || [],
      ...options?.disableDefaultFetchPlugins ? [] : [redirectPlugin],
      ...pluginsFetchPlugins
    ]
  });
  const { $sessionSignal, session, broadcastSessionUpdate } = getSessionAtom($fetch, options);
  const plugins = options?.plugins || [];
  let pluginsActions = {};
  const pluginsAtoms = {
    $sessionSignal,
    session
  };
  const pluginPathMethods = {
    "/sign-out": "POST",
    "/revoke-sessions": "POST",
    "/revoke-other-sessions": "POST",
    "/delete-user": "POST"
  };
  const atomListeners = [{
    signal: "$sessionSignal",
    matcher(path) {
      return path === "/sign-out" || path === "/update-user" || path === "/update-session" || path === "/sign-up/email" || path === "/sign-in/email" || path === "/delete-user" || path === "/verify-email" || path === "/revoke-sessions" || path === "/revoke-session" || path === "/revoke-other-sessions" || path === "/change-email" || path === "/change-password";
    },
    callback(path) {
      if (path === "/sign-out") broadcastSessionUpdate("signout");
      else if (path === "/update-user" || path === "/update-session") broadcastSessionUpdate("updateUser");
    }
  }];
  for (const plugin of plugins) {
    if (plugin.getAtoms) Object.assign(pluginsAtoms, plugin.getAtoms?.($fetch));
    if (plugin.pathMethods) Object.assign(pluginPathMethods, plugin.pathMethods);
    if (plugin.atomListeners) atomListeners.push(...plugin.atomListeners);
  }
  const $store = {
    notify: (signal) => {
      pluginsAtoms[signal].set(!pluginsAtoms[signal].get());
    },
    listen: (signal, listener) => {
      pluginsAtoms[signal].subscribe(listener);
    },
    atoms: pluginsAtoms
  };
  for (const plugin of plugins) if (plugin.getActions) pluginsActions = defu(plugin.getActions?.($fetch, $store, options) ?? {}, pluginsActions);
  return {
    get baseURL() {
      return baseURL;
    },
    pluginsActions,
    pluginsAtoms,
    pluginPathMethods,
    atomListeners,
    $fetch,
    $store
  };
};
function isAtom(value) {
  return typeof value === "object" && value !== null && "get" in value && typeof value.get === "function" && "lc" in value && typeof value.lc === "number";
}
function getMethod(path, knownPathMethods, args) {
  const method = knownPathMethods[path];
  const { fetchOptions, query: _query, ...body } = args || {};
  if (method) return method;
  if (fetchOptions?.method) return fetchOptions.method;
  if (body && Object.keys(body).length > 0) return "POST";
  return "GET";
}
function createDynamicPathProxy(routes, client, knownPathMethods, atoms, atomListeners) {
  function createProxy(path = []) {
    return new Proxy(function() {
    }, {
      get(_, prop) {
        if (typeof prop !== "string") return;
        if (prop === "then" || prop === "catch" || prop === "finally") return;
        const fullPath = [...path, prop];
        let current = routes;
        for (const segment of fullPath) if (current && typeof current === "object" && segment in current) current = current[segment];
        else {
          current = void 0;
          break;
        }
        if (typeof current === "function") return current;
        if (isAtom(current)) return current;
        return createProxy(fullPath);
      },
      apply: async (_, __, args) => {
        const routePath = "/" + path.map(toKebabCase).join("/");
        const arg = args[0] || {};
        const fetchOptions = args[1] || {};
        const { query, fetchOptions: argFetchOptions, ...body } = arg;
        const options = {
          ...fetchOptions,
          ...argFetchOptions
        };
        const method = getMethod(routePath, knownPathMethods, arg);
        return await client(routePath, {
          ...options,
          body: method === "GET" ? void 0 : {
            ...body,
            ...options?.body || {}
          },
          query: query || options?.query,
          method,
          async onSuccess(context) {
            await options?.onSuccess?.(context);
            if (!atomListeners || options.disableSignal) return;
            const matches = atomListeners.filter((s) => s.matcher(routePath));
            if (!matches.length) return;
            const visited = /* @__PURE__ */ new Set();
            for (const match of matches) {
              const signal = atoms[match.signal];
              if (!signal) return;
              if (visited.has(match.signal)) continue;
              visited.add(match.signal);
              const val = signal.get();
              setTimeout(() => {
                signal.set(!val);
              }, 10);
              match.callback?.(routePath);
            }
          }
        });
      }
    });
  }
  return createProxy();
}
function useStore(store, options = {}) {
  const snapshotRef = useRef(store.get());
  const { keys, deps = [store, keys] } = options;
  const subscribe = useCallback((onChange) => {
    const emitChange = (value) => {
      if (snapshotRef.current === value) return;
      snapshotRef.current = value;
      onChange();
    };
    emitChange(store.value);
    if (keys?.length) return listenKeys(store, keys, emitChange);
    return store.listen(emitChange);
  }, deps);
  const get = () => snapshotRef.current;
  return useSyncExternalStore(subscribe, get, get);
}
function getAtomKey(str) {
  return `use${capitalizeFirstLetter(str)}`;
}
function createAuthClient(options) {
  const { pluginPathMethods, pluginsActions, pluginsAtoms, $fetch, $store, atomListeners } = getClientConfig(options);
  const resolvedHooks = {};
  for (const [key, value] of Object.entries(pluginsAtoms)) resolvedHooks[getAtomKey(key)] = () => useStore(value);
  return createDynamicPathProxy({
    ...pluginsActions,
    ...resolvedHooks,
    $fetch,
    $store
  }, $fetch, pluginPathMethods, pluginsAtoms, atomListeners);
}
const convexClient = () => {
  return {
    id: "convex",
    version: VERSION,
    $InferServerPlugin: {}
  };
};
const authClient = createAuthClient({
  plugins: [
    magicLinkClient(),
    emailOTPClient(),
    twoFactorClient(),
    anonymousClient(),
    convexClient()
  ]
});
const seo = ({
  title,
  description,
  keywords,
  image
}) => {
  const tags = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:creator", content: "@tannerlinsley" },
    { name: "twitter:site", content: "@tannerlinsley" },
    { name: "og:type", content: "website" },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    ...image ? [
      { name: "twitter:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "og:image", content: image }
    ] : []
  ];
  return tags;
};
const getAuth = createServerFn({
  method: "GET"
}).handler(createSsrRpc("cb2b3e5e1e8306e053224009604ac2548a745898344521b332eb26227a28d58b"));
const Route$b = createRootRouteWithContext()({
  head: () => ({
    meta: [{
      charSet: "utf-8"
    }, {
      name: "viewport",
      content: "width=device-width, initial-scale=1"
    }, ...seo({
      title: "Convex + Better Auth + TanStack Start",
      description: `Convex + Better Auth + TanStack Start`
    })],
    links: [{
      rel: "stylesheet",
      href: appCss
    }, {
      rel: "icon",
      href: "/favicon.ico"
    }]
  }),
  beforeLoad: async (ctx) => {
    const token = await getAuth();
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }
    return {
      isAuthenticated: !!token,
      token
    };
  },
  component: RootComponent
});
function RootComponent() {
  const context = useRouteContext({
    from: Route$b.id
  });
  return /* @__PURE__ */ jsx(ConvexBetterAuthProvider, { client: context.convexQueryClient.convexClient, authClient, initialToken: context.token, children: /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(Outlet, {}) }) });
}
function RootDocument({
  children
}) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", className: "dark", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { className: "bg-neutral-950 text-neutral-50", children: [
      children,
      /* @__PURE__ */ jsx(ReactQueryDevtools, {}),
      /* @__PURE__ */ jsx(TanStackRouterDevtools, { position: "bottom-right" }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$9 = () => import("./sign-up-fPntvDCn.js");
const Route$a = createFileRoute("/sign-up")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component"),
  beforeLoad: ({
    context
  }) => {
    if (context.isAuthenticated) {
      throw redirect({
        to: "/"
      });
    }
  }
});
const $$splitComponentImporter$8 = () => import("./sign-in-jx6VawwE.js");
const Route$9 = createFileRoute("/sign-in")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component"),
  beforeLoad: ({
    context
  }) => {
    if (context.isAuthenticated) {
      console.log("redirecting to /");
      throw redirect({
        to: "/"
      });
    }
  }
});
const $$splitComponentImporter$7 = () => import("./reset-password-C-nYW3o8.js");
const Route$8 = createFileRoute("/reset-password")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./_authed-DlnBRP6y.js");
const Route$7 = createFileRoute("/_authed")({
  beforeLoad: ({
    context
  }) => {
    if (!context.isAuthenticated) {
      console.log("redirecting to /sign-in");
      throw redirect({
        to: "/sign-in"
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const api = anyApi;
componentsGeneric();
const IST_OFFSET_MIN = 330;
const DAY_START_MIN = 17 * 60;
function pad2(n) {
  return n < 10 ? `0${n}` : `${n}`;
}
function formatYMD(d) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}
function operationalDateString(nowMs = Date.now()) {
  const d = new Date(nowMs + IST_OFFSET_MIN * 6e4);
  const minutes = d.getUTCHours() * 60 + d.getUTCMinutes();
  if (minutes < DAY_START_MIN) {
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return formatYMD(d);
}
const $$splitComponentImporter$5 = () => import("./index-8GhOCTKL.js");
const Route$6 = createFileRoute("/_authed/")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component"),
  loader: async ({
    context
  }) => {
    await Promise.all([context.queryClient.ensureQueryData(convexQuery(api.auth.getCurrentUser, {})), context.queryClient.ensureQueryData(convexQuery(api.visits.dashboard, {
      date: operationalDateString()
    }))]);
  }
});
const $$splitComponentImporter$4 = () => import("./settings-H4kvaYwt.js");
const Route$5 = createFileRoute("/_authed/settings")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component"),
  loader: async ({
    context
  }) => {
    await Promise.all([context.queryClient.ensureQueryData(convexQuery(api.auth.getCurrentUser, {})), context.queryClient.ensureQueryData(convexQuery(api.auth.hasPassword, {}))]);
  }
});
const $$splitComponentImporter$3 = () => import("./index--lgtKsdM.js");
const Route$4 = createFileRoute("/_authed/routes/")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component"),
  loader: async ({
    context
  }) => {
    await Promise.all([context.queryClient.ensureQueryData(convexQuery(api.auth.getCurrentUser, {})), context.queryClient.ensureQueryData(convexQuery(api.routes.list, {}))]);
  }
});
const Route$3 = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handler(request),
      POST: ({ request }) => handler(request)
    }
  }
});
const $$splitComponentImporter$2 = () => import("./new-Bjpv25TT.js");
const Route$2 = createFileRoute("/_authed/routes/new")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component"),
  loader: async ({
    context
  }) => {
    await context.queryClient.ensureQueryData(convexQuery(api.auth.getCurrentUser, {}));
  }
});
const $$splitComponentImporter$1 = () => import("./_routeId-BURAjeHy.js");
const Route$1 = createFileRoute("/_authed/routes/$routeId")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component"),
  loader: async ({
    context,
    params
  }) => {
    await Promise.all([context.queryClient.ensureQueryData(convexQuery(api.auth.getCurrentUser, {})), context.queryClient.ensureQueryData(convexQuery(api.routes.get, {
      id: params.routeId
    }))]);
  }
});
const $$splitComponentImporter = () => import("./_routeId-cGyfZFKZ.js");
const Route = createFileRoute("/_authed/daily/$routeId")({
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  loader: async ({
    context,
    params
  }) => {
    const id = params.routeId;
    await Promise.all([context.queryClient.ensureQueryData(convexQuery(api.auth.getCurrentUser, {})), context.queryClient.ensureQueryData(convexQuery(api.routes.get, {
      id
    })), context.queryClient.ensureQueryData(convexQuery(api.visits.byRouteDate, {
      routeId: id
    }))]);
  }
});
const SignUpRoute = Route$a.update({
  id: "/sign-up",
  path: "/sign-up",
  getParentRoute: () => Route$b
});
const SignInRoute = Route$9.update({
  id: "/sign-in",
  path: "/sign-in",
  getParentRoute: () => Route$b
});
const ResetPasswordRoute = Route$8.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$b
});
const AuthedRoute = Route$7.update({
  id: "/_authed",
  getParentRoute: () => Route$b
});
const AuthedIndexRoute = Route$6.update({
  id: "/",
  path: "/",
  getParentRoute: () => AuthedRoute
});
const AuthedSettingsRoute = Route$5.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AuthedRoute
});
const AuthedRoutesIndexRoute = Route$4.update({
  id: "/routes/",
  path: "/routes/",
  getParentRoute: () => AuthedRoute
});
const ApiAuthSplatRoute = Route$3.update({
  id: "/api/auth/$",
  path: "/api/auth/$",
  getParentRoute: () => Route$b
});
const AuthedRoutesNewRoute = Route$2.update({
  id: "/routes/new",
  path: "/routes/new",
  getParentRoute: () => AuthedRoute
});
const AuthedRoutesRouteIdRoute = Route$1.update({
  id: "/routes/$routeId",
  path: "/routes/$routeId",
  getParentRoute: () => AuthedRoute
});
const AuthedDailyRouteIdRoute = Route.update({
  id: "/daily/$routeId",
  path: "/daily/$routeId",
  getParentRoute: () => AuthedRoute
});
const AuthedRouteChildren = {
  AuthedSettingsRoute,
  AuthedIndexRoute,
  AuthedDailyRouteIdRoute,
  AuthedRoutesRouteIdRoute,
  AuthedRoutesNewRoute,
  AuthedRoutesIndexRoute
};
const AuthedRouteWithChildren = AuthedRoute._addFileChildren(AuthedRouteChildren);
const rootRouteChildren = {
  AuthedRoute: AuthedRouteWithChildren,
  ResetPasswordRoute,
  SignInRoute,
  SignUpRoute,
  ApiAuthSplatRoute
};
const routeTree = Route$b._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultCatchBoundary({ error }) {
  const router2 = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId
  });
  console.error(error);
  return /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6", children: [
    /* @__PURE__ */ jsx(ErrorComponent, { error }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center flex-wrap", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            void router2.invalidate();
          },
          className: `px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded text-white uppercase font-extrabold`,
          children: "Try Again"
        }
      ),
      isRoot ? /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          className: `px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded text-white uppercase font-extrabold`,
          children: "Home"
        }
      ) : /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          className: `px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded text-white uppercase font-extrabold`,
          onClick: (e) => {
            e.preventDefault();
            window.history.back();
          },
          children: "Go Back"
        }
      )
    ] })
  ] });
}
function NotFound({ children }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2 p-2", children: [
    /* @__PURE__ */ jsx("div", { className: "text-gray-600 dark:text-gray-400", children: children || /* @__PURE__ */ jsx("p", { children: "The page you are looking for does not exist." }) }),
    /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.history.back(),
          className: "bg-emerald-500 text-white px-2 py-1 rounded uppercase font-black text-sm",
          children: "Go back"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          className: "bg-cyan-600 text-white px-2 py-1 rounded uppercase font-black text-sm",
          children: "Start Over"
        }
      )
    ] })
  ] });
}
function getRouter() {
  if (typeof document !== "undefined") {
    notifyManager.setScheduler(window.requestAnimationFrame);
  }
  const convexUrl = "https://harmless-chinchilla-551.convex.cloud";
  const convexQueryClient = new ConvexQueryClient(convexUrl, {
    expectAuth: true
  });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn()
      }
    }
  });
  convexQueryClient.connect(queryClient);
  const router2 = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => /* @__PURE__ */ jsx(NotFound, {}),
    context: { queryClient, convexQueryClient },
    scrollRestoration: true
  });
  setupRouterSsrQueryIntegration({
    router: router2,
    queryClient
  });
  return router2;
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$1 as R,
  api as a,
  authClient as b,
  Route as c,
  operationalDateString as o,
  router as r
};
