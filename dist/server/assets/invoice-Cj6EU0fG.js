import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { useAction } from "convex/react";
import { Check, ReceiptText, Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { a as api } from "./router-4kTeY6y1.js";
import { A as AppHeader } from "./AppHeader-rUzkVB5l.js";
import { e as cn, C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent, B as Button } from "./card-CmruOdWT.js";
import { L as Label, I as Input } from "./label-BtOcBn8z.js";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import "@tanstack/react-router";
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
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(
      CheckboxPrimitive.Indicator,
      {
        className: cn("flex items-center justify-center text-current"),
        children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" })
      }
    )
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
function Table({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "table-container",
      className: "relative w-full overflow-x-auto",
      children: /* @__PURE__ */ jsx(
        "table",
        {
          "data-slot": "table",
          className: cn("w-full caption-bottom text-sm", className),
          ...props
        }
      )
    }
  );
}
function TableHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "thead",
    {
      "data-slot": "table-header",
      className: cn("[&_tr]:border-b", className),
      ...props
    }
  );
}
function TableBody({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tbody",
    {
      "data-slot": "table-body",
      className: cn("[&_tr:last-child]:border-0", className),
      ...props
    }
  );
}
function TableRow({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tr",
    {
      "data-slot": "table-row",
      className: cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      ),
      ...props
    }
  );
}
function TableHead({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "th",
    {
      "data-slot": "table-head",
      className: cn(
        "text-muted-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      ),
      ...props
    }
  );
}
function TableCell({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "td",
    {
      "data-slot": "table-cell",
      className: cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      ),
      ...props
    }
  );
}
async function parseMis(file) {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, {
    type: "array"
  });
  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
      header: 1,
      blankrows: false
    });
    for (let i = 0; i < rows.length; i++) {
      const header = rows[i].map((c) => typeof c === "string" ? c.trim().toLowerCase() : c);
      const routeCol = header.findIndex((c) => c === "route");
      const totalCol = header.findIndex((c) => c === "total");
      if (routeCol === -1 || totalCol === -1) continue;
      const cityCol = header.findIndex((c) => c === "city");
      const zones = [];
      for (let j = i + 1; j < rows.length; j++) {
        const route = rows[j][routeCol];
        const total = rows[j][totalCol];
        if (typeof route === "string" && route.trim() && typeof total === "number") {
          zones.push({
            city: cityCol !== -1 ? String(rows[j][cityCol] ?? "") : "",
            route: route.trim(),
            amount: total
          });
        }
      }
      if (zones.length > 0) return zones;
    }
  }
  throw new Error('Could not find a summary sheet with "Route" and "Total" columns');
}
function todayDMY() {
  const d = /* @__PURE__ */ new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`;
}
const inr = (n) => n.toLocaleString("en-IN", {
  maximumFractionDigits: 2
});
function InvoicePage() {
  const createInvoice = useAction(api.invoices.createInvoice);
  const [fileName, setFileName] = useState(null);
  const [zones, setZones] = useState([]);
  const [parseError, setParseError] = useState(null);
  const [gstRate, setGstRate] = useState("5");
  const [itemize, setItemize] = useState(true);
  const [documentDate, setDocumentDate] = useState(todayDMY());
  const [notes, setNotes] = useState("");
  const [custName, setCustName] = useState("Cmunity Innovations Private Limited");
  const [custGstin, setCustGstin] = useState("06AAICC7028B1Z0");
  const [custAddr1, setCustAddr1] = useState("12th Floor, Imperia Mindspace");
  const [custAddr2, setCustAddr2] = useState("Golf Course Ext Rd, Sector 62");
  const [custCity, setCustCity] = useState("Gurugram");
  const [custState, setCustState] = useState("HARYANA");
  const [custPin, setCustPin] = useState("122001");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const grandTotal = zones.reduce((s, z) => s + z.amount, 0);
  const gst = Number(gstRate) || 0;
  const taxAmount = grandTotal * gst / 100;
  const total = grandTotal + taxAmount;
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError(null);
    setZones([]);
    setResult(null);
    try {
      const parsed = await parseMis(file);
      setZones(parsed);
      toast.success(`Parsed ${parsed.length} zone(s)`);
    } catch (err) {
      console.error(err);
      setParseError(err instanceof Error ? err.message : "Could not parse the file");
    }
  };
  const handleGenerate = async () => {
    if (zones.length === 0) {
      toast.error("Upload an MIS Excel first");
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await createInvoice({
        documentDate,
        notes: notes.trim() || void 0,
        gstRate: gst,
        itemize,
        customer: {
          name: custName.trim(),
          gstin: custGstin.trim() || void 0,
          billing: {
            addressLine1: custAddr1.trim(),
            addressLine2: custAddr2.trim() || void 0,
            city: custCity.trim(),
            state: custState.trim(),
            pincode: custPin.trim()
          }
        },
        zones
      });
      setResult({
        serialNumber: res.serialNumber,
        total: res.total
      });
      toast.success(`Invoice ${res.serialNumber ?? ""} created`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not create invoice");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto min-h-screen w-full max-w-4xl space-y-6 p-4", children: [
    /* @__PURE__ */ jsx(AppHeader, {}),
    /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-xl font-semibold", children: [
      /* @__PURE__ */ jsx(ReceiptText, { size: 20 }),
      " Generate invoice from MIS"
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "1. Upload MIS Excel" }),
        /* @__PURE__ */ jsxs(CardDescription, { children: [
          "The summary sheet must have ",
          /* @__PURE__ */ jsx("b", { children: "Route" }),
          " and ",
          /* @__PURE__ */ jsx("b", { children: "Total" }),
          " columns. Each zone's total is summed for the invoice."
        ] })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex w-fit cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent", children: [
          /* @__PURE__ */ jsx(Upload, { size: 16 }),
          fileName ?? "Choose .xlsx file",
          /* @__PURE__ */ jsx("input", { type: "file", accept: ".xlsx,.xls", className: "hidden", onChange: handleFile })
        ] }),
        parseError && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500", children: parseError }),
        zones.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(Table, { children: [
            /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableHead, { children: "#" }),
              /* @__PURE__ */ jsx(TableHead, { children: "City" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Route" }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Total (₹)" })
            ] }) }),
            /* @__PURE__ */ jsxs(TableBody, { children: [
              zones.map((z, i) => /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableCell, { children: i + 1 }),
                /* @__PURE__ */ jsx(TableCell, { children: z.city }),
                /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: z.route }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: inr(z.amount) })
              ] }, i)),
              /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableCell, { colSpan: 3, className: "text-right font-semibold", children: "Grand total (taxable)" }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-right font-semibold", children: inr(grandTotal) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(FileSpreadsheet, { size: 14, className: "text-muted-foreground" }),
            /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground text-sm", children: [
              zones.length,
              " zones · taxable ",
              inr(grandTotal),
              " · +",
              gst,
              "% GST",
              " ",
              inr(taxAmount),
              " · ",
              /* @__PURE__ */ jsxs("b", { children: [
                "total ",
                inr(total)
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "2. Customer & invoice" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2 sm:col-span-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Customer name" }),
          /* @__PURE__ */ jsx(Input, { value: custName, onChange: (e) => setCustName(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "GSTIN" }),
          /* @__PURE__ */ jsx(Input, { value: custGstin, onChange: (e) => setCustGstin(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Invoice date (DD-MM-YYYY)" }),
          /* @__PURE__ */ jsx(Input, { value: documentDate, onChange: (e) => setDocumentDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2 sm:col-span-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Address line 1" }),
          /* @__PURE__ */ jsx(Input, { value: custAddr1, onChange: (e) => setCustAddr1(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2 sm:col-span-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Address line 2" }),
          /* @__PURE__ */ jsx(Input, { value: custAddr2, onChange: (e) => setCustAddr2(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "City" }),
          /* @__PURE__ */ jsx(Input, { value: custCity, onChange: (e) => setCustCity(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "State" }),
          /* @__PURE__ */ jsx(Input, { value: custState, onChange: (e) => setCustState(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Pincode" }),
          /* @__PURE__ */ jsx(Input, { value: custPin, onChange: (e) => setCustPin(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "GST %" }),
          /* @__PURE__ */ jsx(Input, { value: gstRate, onChange: (e) => setGstRate(e.target.value), inputMode: "numeric" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-2 sm:col-span-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsx(Input, { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Shipment for May 2026" })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm sm:col-span-2", children: [
          /* @__PURE__ */ jsx(Checkbox, { checked: itemize, onCheckedChange: (c) => setItemize(c === true) }),
          "One line item per zone (uncheck for a single “Logistics Services” line)"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxs(Button, { onClick: handleGenerate, disabled: submitting || zones.length === 0, children: [
        submitting ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsx(ReceiptText, { size: 16 }),
        "Generate Swipe invoice"
      ] }),
      result && /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
        "✅ Created ",
        /* @__PURE__ */ jsx("b", { children: result.serialNumber ?? "invoice" }),
        " · total ₹",
        inr(result.total)
      ] })
    ] }),
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
export {
  InvoicePage as component
};
