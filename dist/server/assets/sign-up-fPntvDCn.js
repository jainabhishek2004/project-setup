import { jsx, jsxs } from "react/jsx-runtime";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent, B as Button, f as CardFooter } from "./card-CmruOdWT.js";
import { L as Label, I as Input } from "./label-BtOcBn8z.js";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { b as authClient } from "./router-u7K94VBP.js";
import { toast } from "sonner";
import { useNavigate, Link } from "@tanstack/react-router";
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
import "./auth-server-OeSBPYOe.js";
import "common-tags";
import "convex/browser";
import "@better-auth/utils/base64";
import "@better-auth/utils/binary";
import "@better-auth/utils/hmac";
import "convex-helpers";
import "jose";
function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSignUp = async () => {
    const { data, error } = await authClient.signUp.email(
      {
        email,
        password,
        name: `${firstName} ${lastName}`,
        image: image ? await convertImageToBase64(image) : ""
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: async () => {
          setLoading(false);
          await navigate({ to: "/" });
        },
        onError: async (ctx) => {
          setLoading(false);
          console.error(ctx.error);
          console.error("response", ctx.response);
          toast.error(ctx.error.message);
        }
      }
    );
    console.log({ data, error });
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen w-full flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(Card, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-lg md:text-xl", children: "Sign Up" }),
        /* @__PURE__ */ jsx(CardDescription, { className: "text-xs md:text-sm", children: "Enter your information to create an account" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "first-name", children: "First name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "first-name",
                placeholder: "Max",
                required: true,
                onChange: (e) => {
                  setFirstName(e.target.value);
                },
                value: firstName
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "last-name", children: "Last name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "last-name",
                placeholder: "Robinson",
                required: true,
                onChange: (e) => {
                  setLastName(e.target.value);
                },
                value: lastName
              }
            )
          ] })
        ] }),
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
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              autoComplete: "new-password",
              placeholder: "Password"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Confirm Password" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password_confirmation",
              type: "password",
              value: passwordConfirmation,
              onChange: (e) => setPasswordConfirmation(e.target.value),
              autoComplete: "new-password",
              placeholder: "Confirm Password"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "image", children: "Profile Image (optional)" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-4", children: [
            imagePreview && /* @__PURE__ */ jsx("div", { className: "relative w-16 h-16 rounded-sm overflow-hidden", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: imagePreview,
                alt: "Profile preview",
                className: "w-full h-full object-cover"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 w-full", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "image",
                  type: "file",
                  accept: "image/*",
                  onChange: handleImageChange,
                  className: "w-full"
                }
              ),
              imagePreview && /* @__PURE__ */ jsx(
                X,
                {
                  className: "cursor-pointer",
                  onClick: () => {
                    setImage(null);
                    setImagePreview(null);
                  }
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "w-full",
            disabled: loading,
            onClick: handleSignUp,
            children: loading ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : "Create an account"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsx("div", { className: "flex justify-center w-full border-t py-4", children: /* @__PURE__ */ jsxs("p", { className: "text-center text-xs text-neutral-500", children: [
        "Secured by ",
        /* @__PURE__ */ jsx("span", { className: "text-orange-400", children: "better-auth." })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-center mt-4 text-sm text-neutral-600 dark:text-neutral-400", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/sign-in",
          className: "text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200 underline",
          children: "Sign in"
        }
      )
    ] })
  ] }) });
}
async function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
const SplitComponent = SignUp;
export {
  SplitComponent as component
};
