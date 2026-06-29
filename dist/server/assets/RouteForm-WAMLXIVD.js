import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { a as api } from "./router-BY3u6Q8c.js";
import { B as Button } from "./button-Cm5QyDGI.js";
import { L as Label, I as Input } from "./label-BKqcuK7M.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-rgUlqyCc.js";
const emptyStop = () => ({ name: "", lat: "", lng: "", time: "" });
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
function pointToDraft(p) {
  if (!p) return emptyStop();
  return {
    name: p.name,
    lat: String(p.lat),
    lng: String(p.lng),
    time: minutesToTime(p.expectedMinutes)
  };
}
function RouteForm({ initial }) {
  const navigate = useNavigate();
  const create = useMutation(api.routes.create);
  const update = useMutation(api.routes.update);
  const [name, setName] = useState(initial?.name ?? "");
  const [vehicle, setVehicle] = useState(initial?.vehicleRegistration ?? "");
  const [start, setStart] = useState(pointToDraft(initial?.start));
  const [stops, setStops] = useState(
    initial && initial.stops.length > 0 ? initial.stops.map((s) => pointToDraft(s)) : [emptyStop()]
  );
  const [saving, setSaving] = useState(false);
  const updateStart = (patch) => setStart((prev) => ({ ...prev, ...patch }));
  const updateStop = (index, patch) => {
    setStops(
      (prev) => prev.map((s, i) => i === index ? { ...s, ...patch } : s)
    );
  };
  const addStop = () => setStops((prev) => [...prev, emptyStop()]);
  const removeStop = (index) => setStops((prev) => prev.filter((_, i) => i !== index));
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !vehicle.trim()) {
      toast.error("Route name and vehicle number are required");
      return;
    }
    const startLat = Number(start.lat);
    const startLng = Number(start.lng);
    if (!start.name.trim() || !start.time || Number.isNaN(startLat) || Number.isNaN(startLng)) {
      toast.error("Start point needs a name, departure time, and valid lat/lng");
      return;
    }
    const parsedStart = {
      name: start.name.trim(),
      lat: startLat,
      lng: startLng,
      expectedMinutes: timeToMinutes(start.time)
    };
    const parsedStops = [];
    for (const s of stops) {
      const lat = Number(s.lat);
      const lng = Number(s.lng);
      if (!s.name.trim() || !s.time || Number.isNaN(lat) || Number.isNaN(lng)) {
        toast.error("Each drop point needs a name, time, and valid lat/lng");
        return;
      }
      parsedStops.push({
        name: s.name.trim(),
        lat,
        lng,
        expectedMinutes: timeToMinutes(s.time)
      });
    }
    if (parsedStops.length === 0) {
      toast.error("Add at least one drop point");
      return;
    }
    setSaving(true);
    try {
      if (initial) {
        await update({
          id: initial.id,
          name,
          vehicleRegistration: vehicle,
          start: parsedStart,
          stops: parsedStops
        });
        toast.success("Route updated");
      } else {
        await create({
          name,
          vehicleRegistration: vehicle,
          start: parsedStart,
          stops: parsedStops
        });
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
              placeholder: "Morning delivery loop"
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
              placeholder: "MH12AB1234"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Start point" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Start / parking name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              value: start.name,
              onChange: (e) => updateStart({ name: e.target.value }),
              placeholder: "Depot / Parking"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Latitude" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              value: start.lat,
              onChange: (e) => updateStart({ lat: e.target.value }),
              placeholder: "19.0760",
              inputMode: "decimal"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Longitude" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              value: start.lng,
              onChange: (e) => updateStart({ lng: e.target.value }),
              placeholder: "72.8777",
              inputMode: "decimal"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Departure time" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "time",
              value: start.time,
              onChange: (e) => updateStart({ time: e.target.value })
            }
          )
        ] })
      ] }) })
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
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-xs", children: "The operational day runs 5 PM–7 AM. Times from 5 PM onward are this evening; times before 5 PM count as the next morning." }),
        stops.map((stop, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_1fr_auto_auto] sm:items-end",
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
                    placeholder: "19.0760",
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
                    placeholder: "72.8777",
                    inputMode: "decimal"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Expected time" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    type: "time",
                    value: stop.time,
                    onChange: (e) => updateStop(index, { time: e.target.value })
                  }
                )
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
