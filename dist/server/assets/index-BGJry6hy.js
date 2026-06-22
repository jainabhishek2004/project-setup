import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation } from "convex/react";
import { b as api, a as authClient } from "./router-CI02LW4I.js";
import { convexQuery } from "@convex-dev/react-query";
import { B as Button, I as Input } from "./input-CdKrjkM9.js";
import { Check, X, Trash2, LogOut, Settings } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
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
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
const useCreateTodo = () => useMutation(api.todos.create).withOptimisticUpdate((localStore, args) => {
  const todos = localStore.getQuery(api.todos.get);
  if (!todos) {
    return;
  }
  const user = localStore.getQuery(api.auth.getCurrentUser);
  if (!user) {
    return;
  }
  localStore.setQuery(api.todos.get, {}, [
    {
      _id: crypto.randomUUID(),
      _creationTime: Date.now(),
      text: args.text,
      completed: false,
      userId: user._id
    },
    ...todos
  ]);
});
const useToggleCompleted = () => useMutation(api.todos.toggle).withOptimisticUpdate((localStore, args) => {
  const todos = localStore.getQuery(api.todos.get);
  if (!todos) {
    return;
  }
  const index = todos.findIndex((todo2) => todo2._id === args.id);
  const todo = todos[index];
  if (!todo) {
    return;
  }
  localStore.setQuery(
    api.todos.get,
    {},
    todos.toSpliced(index, 1, {
      ...todo,
      completed: !todo.completed
    })
  );
});
const useRemoveTodo = () => useMutation(api.todos.remove).withOptimisticUpdate((localStore, args) => {
  const todos = localStore.getQuery(api.todos.get);
  if (!todos) {
    return;
  }
  const index = todos.findIndex((todo) => todo._id === args.id);
  localStore.setQuery(api.todos.get, {}, todos.toSpliced(index, 1));
});
const AddTodoForm = () => {
  const create = useCreateTodo();
  const form = useForm({
    defaultValues: {
      text: ""
    },
    onSubmit: async ({ value, formApi }) => {
      create({ text: value.text.trim() });
      formApi.reset();
    }
  });
  return /* @__PURE__ */ jsxs(
    "form",
    {
      className: "flex gap-2",
      onSubmit: (e) => {
        e.preventDefault();
        form.handleSubmit();
      },
      children: [
        /* @__PURE__ */ jsx(
          form.Field,
          {
            name: "text",
            children: (field) => /* @__PURE__ */ jsx(
              Input,
              {
                id: field.name,
                name: field.name,
                value: field.state.value,
                onChange: (e) => field.handleChange(e.target.value),
                placeholder: "Add a new todo...",
                className: "bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500"
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(Button, { type: "submit", variant: "secondary", children: "Add" })
      ]
    }
  );
};
const TodoList = () => {
  const { data: todos } = useSuspenseQuery(convexQuery(api.todos.get, {}));
  const toggle = useToggleCompleted();
  const remove = useRemoveTodo();
  return /* @__PURE__ */ jsx("main", { children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsx(AddTodoForm, {}),
    /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: todos.map((todo) => /* @__PURE__ */ jsxs(
      "li",
      {
        className: "flex items-center gap-3 p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg group hover:bg-neutral-900 transition-colors",
        children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800",
              onClick: () => toggle({ id: todo._id }),
              children: todo.completed ? /* @__PURE__ */ jsx(Check, { size: 16, className: "text-green-500" }) : /* @__PURE__ */ jsx(X, { size: 16 })
            }
          ),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: todo.completed ? "flex-1 line-through text-neutral-500" : "flex-1 text-neutral-100",
              children: todo.text
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => remove({ id: todo._id }),
              className: "text-neutral-500 hover:text-red-400 hover:bg-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity",
              children: /* @__PURE__ */ jsx(Trash2, { size: 16 })
            }
          )
        ]
      },
      todo._id
    )) }),
    todos.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-center text-neutral-500 py-8", children: "No todos yet. Add one above!" })
  ] }) });
};
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
function App() {
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen w-full p-4 space-y-8", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between max-w-2xl mx-auto", children: [
      /* @__PURE__ */ jsx(UserProfile, { user: user.data }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/settings", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Settings, { size: 16 }),
          "Settings"
        ] }) }) }),
        /* @__PURE__ */ jsx(SignOutButton, { onClick: handleSignOut })
      ] })
    ] }),
    /* @__PURE__ */ jsx(TodoList, {}),
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
export {
  App as component
};
