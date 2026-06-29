import { jsx, jsxs } from "react/jsx-runtime";
import { B as Button } from "./button-Cm5QyDGI.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent, e as CardFooter } from "./card-rgUlqyCc.js";
import { L as Label, I as Input } from "./label-BKqcuK7M.js";
import { a as api, c as authClient } from "./router-BY3u6Q8c.js";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Check, Copy, AlertTriangle } from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
import { useNavigate, Link } from "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
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
function EnableTwoFactor({ onBack }) {
  const { data: user } = useSuspenseQuery(
    convexQuery(api.auth.getCurrentUser, {})
  );
  const { data: hasPassword } = useSuspenseQuery(
    convexQuery(api.auth.hasPassword, {})
  );
  const [step, setStep] = useState(
    hasPassword ? "password" : "need-password"
  );
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [totpUri, setTotpUri] = useState();
  const [backupCodes, setBackupCodes] = useState();
  const [copied, setCopied] = useState(false);
  const handlePasswordSubmit = async () => {
    try {
      setLoading(true);
      const { data } = await authClient.twoFactor.enable({
        password
      });
      if (data?.totpURI) {
        setTotpUri(data.totpURI);
        if (data.backupCodes) {
          setBackupCodes(data.backupCodes);
        }
        setStep("qr-verify");
      }
    } catch {
      alert("Failed to enable 2FA. Please check your password and try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      await authClient.twoFactor.verifyTotp({
        code
      });
      setStep("backup");
    } catch {
      alert("Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const copyBackupCodes = async () => {
    if (!backupCodes) return;
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  const handleResetPassword = async () => {
    if (!user.email) {
      alert("User email not found");
      return;
    }
    try {
      setLoading(true);
      await authClient.requestPasswordReset({
        email: user.email,
        redirectTo: `${"http://localhost:3000"}/reset-password`
      });
      alert("Check your email for password reset instructions");
    } catch {
      alert("Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen w-full flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
    (step === "password" || step === "need-password") && /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "ghost",
        size: "sm",
        className: "flex items-center gap-2 mb-4",
        onClick: onBack,
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { size: 16 }),
          "Back to Settings"
        ]
      }
    ),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-lg md:text-xl", children: "Enable Two-Factor Authentication" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-xs md:text-sm", children: step === "loading" ? "Loading..." : step === "need-password" ? "You need to set up a password before enabling 2FA" : step === "password" ? "Enter your password to begin setup" : step === "qr-verify" ? "Scan this QR code with your authenticator app" : "Save these backup codes in a secure place" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { children: [
        step === "loading" && /* @__PURE__ */ jsx("div", { className: "flex justify-center py-4", children: /* @__PURE__ */ jsx(Loader2, { size: 24, className: "animate-spin" }) }),
        step === "need-password" && /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Two-factor authentication requires a password for additional security. Since you signed up with a social account, you'll need to set up a password first." }),
          /* @__PURE__ */ jsx(Button, { onClick: handleResetPassword, disabled: loading, children: loading ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : "Set Up Password" })
        ] }),
        step === "password" && /* @__PURE__ */ jsxs(
          "form",
          {
            onSubmit: (e) => {
              e.preventDefault();
              handlePasswordSubmit();
            },
            className: "grid gap-4",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "password",
                    type: "password",
                    value: password,
                    onChange: (e) => setPassword(e.target.value),
                    required: true,
                    disabled: loading
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, children: loading ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : "Continue" })
            ]
          }
        ),
        step === "qr-verify" && totpUri && /* @__PURE__ */ jsxs("div", { className: "grid gap-6", children: [
          /* @__PURE__ */ jsx("div", { className: "flex justify-center p-4 bg-white rounded-lg", children: /* @__PURE__ */ jsx(QRCode, { value: totpUri }) }),
          /* @__PURE__ */ jsxs(
            "form",
            {
              onSubmit: (e) => {
                e.preventDefault();
                handleVerifyCode();
              },
              className: "grid gap-4",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "code", children: "Verification Code" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      id: "code",
                      type: "text",
                      placeholder: "Enter 6-digit code",
                      value: code,
                      onChange: (e) => setCode(e.target.value),
                      pattern: "[0-9]*",
                      inputMode: "numeric",
                      maxLength: 6,
                      required: true,
                      disabled: loading
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, children: loading ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : "Verify" })
              ]
            }
          )
        ] }),
        step === "backup" && backupCodes && /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative p-4 bg-muted rounded-lg", children: [
            /* @__PURE__ */ jsx("pre", { className: "text-sm font-mono whitespace-pre-line", children: backupCodes.join("\n") }),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "absolute top-2 right-2",
                onClick: copyBackupCodes,
                children: copied ? /* @__PURE__ */ jsx(Check, { size: 16 }) : /* @__PURE__ */ jsx(Copy, { size: 16 })
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Button, { onClick: () => window.location.reload(), children: "Done" })
        ] })
      ] })
    ] })
  ] }) });
}
function SettingsPage() {
  const [showEnable2FA, setShowEnable2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleDisable2FA = async () => {
    try {
      throw new Error("Not implemented");
      setLoading(true);
      await authClient.twoFactor.disable({
        password: ""
      });
    } catch {
      alert("Failed to disable 2FA. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteAccount = async () => {
    if (window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )) {
      try {
        await authClient.deleteUser();
        void navigate({ to: "/" });
      } catch {
        alert("Failed to delete account. Please try again.");
      }
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen w-full flex items-center justify-center p-4", children: showEnable2FA ? /* @__PURE__ */ jsx(EnableTwoFactor, { onBack: () => setShowEnable2FA(false) }) : /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md space-y-4", children: [
    /* @__PURE__ */ jsx(
      Button,
      {
        variant: "ghost",
        size: "sm",
        className: "flex items-center gap-2",
        asChild: true,
        children: /* @__PURE__ */ jsxs(Link, { to: "/", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { size: 16 }),
          "Back to Dashboard"
        ] })
      }
    ),
    /* @__PURE__ */ jsxs(Card, { className: "w-full", children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-lg md:text-xl", children: "Settings" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-xs md:text-sm", children: "Manage your account settings and security" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium mb-1", children: "Two-Factor Authentication" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Add an extra layer of security to your account by requiring a verification code in addition to your password." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                onClick: () => setShowEnable2FA(true),
                disabled: loading,
                children: "Enable 2FA"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "destructive",
                onClick: handleDisable2FA,
                disabled: loading,
                children: "Disable 2FA"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium mb-1 flex items-center gap-2", children: [
              "Delete Account",
              /* @__PURE__ */ jsx(AlertTriangle, { size: 14, className: "text-destructive" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Permanently delete your account and all associated data. This action cannot be undone." })
          ] }),
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Button, { variant: "destructive", onClick: handleDeleteAccount, children: "Delete Account" }) })
        ] })
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
    ] })
  ] }) });
}
function RouteComponent() {
  return /* @__PURE__ */ jsx(SettingsPage, {});
}
export {
  RouteComponent as component
};
