import { jsx, jsxs } from "react/jsx-runtime";
import { useRouter, Link } from "@tanstack/react-router";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent, B as Button, f as CardFooter } from "./card--6FQJDdo.js";
import { I as Input } from "./input-CitDmZ7s.js";
import { L as Label } from "./label-CcZ7vISR.js";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { c as authClient } from "./router-AUTNzD8t.js";
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
const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [anonymousLoading, setAnonymousLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [signInMethod, setSignInMethod] = useState(
    "passwordless"
  );
  const [otpSent, setOtpSent] = useState(false);
  const handleSignIn = async () => {
    const { data, error } = await authClient.signIn.email(
      {
        email,
        password
      },
      {
        onRequest: () => {
          setOtpLoading(true);
        },
        onSuccess: async (ctx) => {
          setOtpLoading(false);
          if (ctx.data.twoFactorRedirect) ;
          else {
            router.navigate({ to: "/" });
          }
        },
        onError: (ctx) => {
          setOtpLoading(false);
          alert(ctx.error.message);
        }
      }
    );
    console.log({ data, error });
  };
  const handleResetPassword = async () => {
    setForgotLoading(true);
    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: `${"http://localhost:3000"}/reset-password`
      });
      alert("Check your email for the reset password link!");
    } catch {
      alert("Failed to send reset password link. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };
  const handleMagicLinkSignIn = async () => {
    await authClient.signIn.magicLink(
      {
        email
      },
      {
        onRequest: () => {
          setMagicLinkLoading(true);
        },
        onSuccess: () => {
          setMagicLinkLoading(false);
          alert("Check your email for the magic link!");
        },
        onError: (ctx) => {
          setMagicLinkLoading(false);
          alert(ctx.error.message);
        }
      }
    );
  };
  const handleAnonymousSignIn = async () => {
    await authClient.signIn.anonymous(
      {},
      {
        onRequest: () => {
          setAnonymousLoading(true);
        },
        onSuccess: async () => {
          setAnonymousLoading(false);
          router.navigate({ to: "/" });
        },
        onError: (ctx) => {
          setAnonymousLoading(false);
          alert(ctx.error.message);
        }
      }
    );
  };
  const handleGithubSignIn = async () => {
    await authClient.signIn.social(
      {
        provider: "github"
      },
      {
        onRequest: () => {
          setOtpLoading(true);
        },
        onResponse: () => setOtpLoading(false),
        onError: (ctx) => {
          alert(ctx.error.message);
        }
      }
    );
  };
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social(
      {
        provider: "google"
      },
      {
        onRequest: () => {
          setOtpLoading(true);
        },
        onSuccess: () => {
          setOtpLoading(false);
        },
        onError: (ctx) => {
          setOtpLoading(false);
          alert(ctx.error.message);
        }
      }
    );
  };
  const handleOtpSignIn = async () => {
    if (!otpSent) {
      await authClient.emailOtp.sendVerificationOtp(
        {
          email,
          type: "sign-in"
        },
        {
          onRequest: () => {
            setOtpLoading(true);
          },
          onSuccess: () => {
            setOtpLoading(false);
            setOtpSent(true);
          },
          onError: (ctx) => {
            setOtpLoading(false);
            alert(ctx.error.message);
          }
        }
      );
    } else {
      await authClient.signIn.emailOtp(
        {
          email,
          otp
        },
        {
          onRequest: () => {
            setOtpLoading(true);
          },
          onSuccess: async () => {
            setOtpLoading(false);
            router.navigate({ to: "/" });
          },
          onError: (ctx) => {
            setOtpLoading(false);
            alert(ctx.error.message);
          }
        }
      );
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen w-full flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(Card, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-lg md:text-xl", children: "Sign In" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-xs md:text-sm", children: "Enter your email below to login to your account" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(
        "form",
        {
          onSubmit: (e) => {
            e.preventDefault();
            if (signInMethod === "password") {
              void handleSignIn();
            } else if (otpSent) {
              void handleOtpSignIn();
            }
          },
          className: "grid gap-4",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "email",
                  type: "email",
                  placeholder: "m@example.com",
                  required: true,
                  onChange: (e) => {
                    setEmail(e.target.value);
                  },
                  value: email
                }
              )
            ] }),
            signInMethod === "password" && /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    variant: "link",
                    size: "sm",
                    type: "button",
                    onClick: handleResetPassword,
                    className: "cursor-pointer",
                    disabled: forgotLoading || !email,
                    children: [
                      forgotLoading ? /* @__PURE__ */ jsx(Loader2, { size: 14, className: "animate-spin mr-1" }) : null,
                      "Forgot your password?"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "password",
                  type: "password",
                  placeholder: "password",
                  autoComplete: "password",
                  required: true,
                  value: password,
                  onChange: (e) => setPassword(e.target.value)
                }
              )
            ] }),
            signInMethod === "passwordless" && otpSent && /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "otp", children: "Verification Code" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "otp",
                  type: "text",
                  placeholder: "Enter verification code",
                  required: true,
                  value: otp,
                  onChange: (e) => setOtp(e.target.value),
                  pattern: "[0-9]*",
                  inputMode: "numeric",
                  maxLength: 6
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
              signInMethod === "password" && /* @__PURE__ */ jsx(
                Button,
                {
                  type: "submit",
                  className: "w-full",
                  disabled: otpLoading,
                  children: "Sign in with Password"
                }
              ),
              signInMethod === "passwordless" && !otpSent && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    className: "w-full",
                    disabled: magicLinkLoading || otpLoading || anonymousLoading,
                    onClick: handleMagicLinkSignIn,
                    children: magicLinkLoading ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : "Send Magic Link"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    className: "w-full",
                    variant: "outline",
                    disabled: magicLinkLoading || otpLoading || anonymousLoading,
                    onClick: handleOtpSignIn,
                    children: otpLoading ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : "Send Verification Code"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    className: "w-full",
                    variant: "outline",
                    disabled: magicLinkLoading || otpLoading || anonymousLoading,
                    onClick: handleAnonymousSignIn,
                    children: anonymousLoading ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : "Sign in anonymously"
                  }
                )
              ] }),
              signInMethod === "passwordless" && otpSent && /* @__PURE__ */ jsx(
                Button,
                {
                  type: "submit",
                  className: "w-full",
                  disabled: otpLoading,
                  children: otpLoading ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : "Verify Code"
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  className: "text-sm",
                  onClick: () => {
                    setSignInMethod(
                      signInMethod === "password" ? "passwordless" : "password"
                    );
                    setPassword("");
                    setOtp("");
                    setOtpSent(false);
                  },
                  children: signInMethod === "password" ? "Sign in with magic link or OTP instead" : "Sign in with a password instead"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx("span", { className: "w-full border-t border-neutral-800" }) }),
              /* @__PURE__ */ jsx("div", { className: "relative flex justify-center text-xs", children: /* @__PURE__ */ jsx("span", { className: "bg-card px-2 text-neutral-500", children: "or continue with" }) })
            ] }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                type: "button",
                variant: "outline",
                className: "w-full gap-2",
                disabled: otpLoading,
                onClick: handleGithubSignIn,
                children: [
                  /* @__PURE__ */ jsx(
                    "svg",
                    {
                      xmlns: "http://www.w3.org/2000/svg",
                      width: "1em",
                      height: "1em",
                      viewBox: "0 0 24 24",
                      children: /* @__PURE__ */ jsx(
                        "path",
                        {
                          fill: "currentColor",
                          d: "M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
                        }
                      )
                    }
                  ),
                  "Sign in with Github"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                type: "button",
                variant: "outline",
                className: "w-full gap-2",
                disabled: otpLoading,
                onClick: handleGoogleSignIn,
                children: [
                  /* @__PURE__ */ jsxs(
                    "svg",
                    {
                      xmlns: "http://www.w3.org/2000/svg",
                      width: "0.98em",
                      height: "1em",
                      viewBox: "0 0 256 262",
                      children: [
                        /* @__PURE__ */ jsx(
                          "path",
                          {
                            fill: "#4285F4",
                            d: "M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "path",
                          {
                            fill: "#34A853",
                            d: "M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "path",
                          {
                            fill: "#FBBC05",
                            d: "M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "path",
                          {
                            fill: "#EB4335",
                            d: "M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                          }
                        )
                      ]
                    }
                  ),
                  "Sign in with Google"
                ]
              }
            )
          ]
        }
      ) }),
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
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-center mt-4 text-sm text-neutral-600 dark:text-neutral-400", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/sign-up",
          className: "text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200 underline",
          children: "Sign up"
        }
      )
    ] })
  ] }) });
};
const SplitComponent = SignIn;
export {
  SplitComponent as component
};
