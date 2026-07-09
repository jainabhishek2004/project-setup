import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { LogOut, Settings } from "lucide-react";
import { a as api, b as authClient } from "./router-Cfo28kxB.js";
import { B as Button } from "./card-DskBQYqB.js";
const UserProfile = ({
  user
}) => {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
    user?.image ? /* @__PURE__ */ jsx(
      "img",
      {
        src: user.image,
        alt: user.name,
        width: 40,
        height: 40,
        className: "rounded-full"
      }
    ) : /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-200 font-medium", children: user?.name?.[0]?.toUpperCase() }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "font-medium", children: user?.name }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500", children: user?.email })
    ] })
  ] });
};
function SignOutButton({ onClick }) {
  return /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick, children: [
    /* @__PURE__ */ jsx(LogOut, { size: 16, className: "mr-2" }),
    "Sign out"
  ] });
}
function AppHeader() {
  const user = useSuspenseQuery(convexQuery(api.auth.getCurrentUser, {}));
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          location.reload();
        }
      }
    });
  };
  return /* @__PURE__ */ jsxs("header", { className: "flex flex-wrap items-center justify-between gap-4 border-b pb-4", children: [
    /* @__PURE__ */ jsx(UserProfile, { user: user.data }),
    /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/", activeOptions: { exact: true }, children: "Dashboard" }) }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/routes", children: "Routes" }) }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/invoice", children: "Invoice" }) }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/settings", children: [
        /* @__PURE__ */ jsx(Settings, { size: 16, className: "mr-1" }),
        "Settings"
      ] }) }),
      /* @__PURE__ */ jsx(SignOutButton, { onClick: handleSignOut })
    ] })
  ] });
}
export {
  AppHeader as A
};
