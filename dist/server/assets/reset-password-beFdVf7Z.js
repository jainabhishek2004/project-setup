import { jsx, jsxs } from "react/jsx-runtime";
import { C as Card, b as CardHeader, d as CardTitle, e as CardDescription, f as CardFooter, a as CardContent, B as Button } from "./card-DskBQYqB.js";
import { L as Label, I as Input } from "./label-2wnmcrdN.js";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { b as authClient } from "./router-Cfo28kxB.js";
import { useNavigate, useSearch } from "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@tanstack/react-query";
import "@tanstack/react-router-ssr-query";
import "@convex-dev/react-query";
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
import "./auth-server-BiwouQzf.js";
import "common-tags";
import "convex/browser";
import "@better-auth/utils/base64";
import "@better-auth/utils/binary";
import "@better-auth/utils/hmac";
import "convex-helpers";
import "jose";
function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearch({ strict: false });
  const token = searchParams.token;
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    await authClient.resetPassword(
      {
        token,
        newPassword: password
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          void navigate({ to: "/" });
        },
        onError: (ctx) => {
          setLoading(false);
          alert(ctx.error.message);
        }
      }
    );
  };
  if (!token) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen w-full flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs(Card, { className: "max-w-md w-full", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-lg md:text-xl", children: "Invalid Link" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-xs md:text-sm", children: "This password reset link is invalid or has expired. Please request a new one." })
      ] }),
      /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsx("div", { className: "flex justify-center w-full border-t py-4", children: /* @__PURE__ */ jsxs("p", { className: "text-center text-xs text-neutral-500", children: [
        "Powered by",
        " ",
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://better-auth.com",
            className: "underline",
            target: "_blank",
            children: /* @__PURE__ */ jsx("span", { className: "dark:text-orange-200/90", children: "better-auth." })
          }
        )
      ] }) }) })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen w-full flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs(Card, { className: "max-w-md w-full", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-lg md:text-xl", children: "Reset Password" }),
      /* @__PURE__ */ jsx(CardDescription, { className: "text-xs md:text-sm", children: "Enter your new password below" })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleResetPassword, className: "grid gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "New Password" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "password",
            type: "password",
            placeholder: "Enter your new password",
            required: true,
            value: password,
            onChange: (e) => setPassword(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "confirmPassword", children: "Confirm Password" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "confirmPassword",
            type: "password",
            placeholder: "Confirm your new password",
            required: true,
            value: confirmPassword,
            onChange: (e) => setConfirmPassword(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : "Reset Password" })
    ] }) }),
    /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsx("div", { className: "flex justify-center w-full border-t py-4", children: /* @__PURE__ */ jsxs("p", { className: "text-center text-xs text-neutral-500", children: [
      "Powered by",
      " ",
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "https://better-auth.com",
          className: "underline",
          target: "_blank",
          children: /* @__PURE__ */ jsx("span", { className: "dark:text-orange-200/90", children: "better-auth." })
        }
      )
    ] }) }) })
  ] }) });
}
const SplitComponent = ResetPassword;
export {
  SplitComponent as component
};
