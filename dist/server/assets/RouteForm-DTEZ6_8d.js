import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { a as api } from "./router-AUTNzD8t.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent, B as Button } from "./card--6FQJDdo.js";
import { I as Input } from "./input-CitDmZ7s.js";
import { L as Label } from "./label-CcZ7vISR.js";
import { C as Checkbox } from "./checkbox-C-8O2gwD.js";
const emptyStop = () => ({
  name: "",
  lat: "",
  lng: "",
  radius: "100",
  optional: false
});
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
function RouteForm({ initial }) {
  const navigate = useNavigate();
  const create = useMutation(api.routes.create);
  const update = useMutation(api.routes.update);
  const [name, setName] = useState(initial?.name ?? "");
  const [vehicle, setVehicle] = useState(initial?.vehicleRegistration ?? "");
  const [activeStart, setActiveStart] = useState(
    initial?.activeStartMinutes != null ? minutesToTime(initial.activeStartMinutes) : "17:00"
  );
  const [activeEnd, setActiveEnd] = useState(
    initial?.activeEndMinutes != null ? minutesToTime(initial.activeEndMinutes) : "21:00"
  );
  const [stops, setStops] = useState(
    initial && initial.stops.length > 0 ? initial.stops.map((s) => ({
      name: s.name,
      lat: String(s.lat),
      lng: String(s.lng),
      radius: String(s.radiusMeters ?? 100),
      optional: s.optional ?? false
    })) : [emptyStop()]
  );
  const [saving, setSaving] = useState(false);
  const updateStop = (index, patch) => setStops(
    (prev) => prev.map((s, i) => i === index ? { ...s, ...patch } : s)
  );
  const addStop = () => setStops((prev) => [...prev, emptyStop()]);
  const removeStop = (index) => setStops((prev) => prev.filter((_, i) => i !== index));
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !vehicle.trim()) {
      toast.error("Route name and vehicle number are required");
      return;
    }
    if (!activeStart || !activeEnd) {
      toast.error("Set the active-hours window");
      return;
    }
    const parsedStops = [];
    for (const s of stops) {
      const lat = Number(s.lat);
      const lng = Number(s.lng);
      const radius = Number(s.radius);
      if (!s.name.trim() || Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radius) || radius <= 0) {
        toast.error("Each drop point needs a name, valid lat/lng, and radius");
        return;
      }
      parsedStops.push({
        name: s.name.trim(),
        lat,
        lng,
        radiusMeters: radius,
        optional: s.optional
      });
    }
    if (parsedStops.length === 0) {
      toast.error("Add at least one drop point");
      return;
    }
    const payload = {
      name,
      vehicleRegistration: vehicle,
      activeStartMinutes: timeToMinutes(activeStart),
      activeEndMinutes: timeToMinutes(activeEnd),
      stops: parsedStops
    };
    setSaving(true);
    try {
      if (initial) {
        await update({ id: initial.id, ...payload });
        toast.success("Route updated");
      } else {
        await create(payload);
        toast.success("Route created");
      }
      await navigate({ to: "/routes" });
    } catch (err) {
      toast.error("Could not save route");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: initial ? "Edit route" : "New route" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Route name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "name",
              value: name,
              onChange: (e) => setName(e.target.value),
              placeholder: "Evening delivery loop"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "vehicle", children: "Vehicle number" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "vehicle",
              value: vehicle,
              onChange: (e) => setVehicle(e.target.value),
              placeholder: "DL51GD8989"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "active-start", children: "Active from" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "active-start",
              type: "time",
              value: activeStart,
              onChange: (e) => setActiveStart(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "active-end", children: "Active until" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "active-end",
              type: "time",
              value: activeEnd,
              onChange: (e) => setActiveEnd(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-xs sm:col-span-2", children: "The vehicle is monitored only during these hours. Use one route per round (e.g. 5–9 PM and 2–5 AM as two routes) so distance driven between rounds isn't counted." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Drop points" }),
        /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: addStop, children: [
          /* @__PURE__ */ jsx(Plus, { size: 16 }),
          " Add drop point"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-xs", children: [
          "Mark a hub ",
          /* @__PURE__ */ jsx("b", { children: "Optional" }),
          " if the vehicle only visits it ad-hoc. Only non-optional (planned) hubs form the regular optimized route."
        ] }),
        stops.map((stop, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_1fr_auto_auto_auto] sm:items-end",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Location name" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: stop.name,
                    onChange: (e) => updateStop(index, { name: e.target.value }),
                    placeholder: "Warehouse A"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Latitude" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: stop.lat,
                    onChange: (e) => updateStop(index, { lat: e.target.value }),
                    placeholder: "28.5355",
                    inputMode: "decimal"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Longitude" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: stop.lng,
                    onChange: (e) => updateStop(index, { lng: e.target.value }),
                    placeholder: "77.3910",
                    inputMode: "decimal"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Radius (m)" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: stop.radius,
                    onChange: (e) => updateStop(index, { radius: e.target.value }),
                    placeholder: "100",
                    inputMode: "numeric",
                    className: "w-24"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 pb-2 text-xs whitespace-nowrap", children: [
                /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    checked: stop.optional,
                    onCheckedChange: (c) => updateStop(index, { optional: c === true })
                  }
                ),
                "Optional"
              ] }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "icon",
                  onClick: () => removeStop(index),
                  disabled: stops.length === 1,
                  className: "text-muted-foreground hover:text-red-500",
                  children: /* @__PURE__ */ jsx(Trash2, { size: 16 })
                }
              )
            ]
          },
          index
        ))
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: saving, children: saving ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : initial ? "Save changes" : "Create route" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          variant: "ghost",
          onClick: () => navigate({ to: "/routes" }),
          children: "Cancel"
        }
      )
    ] })
  ] });
}
export {
  RouteForm as R
};
