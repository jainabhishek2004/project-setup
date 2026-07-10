import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Toaster, toast } from 'sonner'
import { useAction } from 'convex/react'
import {
  Download,
  FileSpreadsheet,
  Loader2,
  ReceiptText,
  Upload,
} from 'lucide-react'

import { api } from '~/convex/_generated/api'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/_authed/invoice')({
  component: InvoicePage,
})

type Zone = { city: string; route: string; amount: number }

const lower = (c: unknown) =>
  typeof c === 'string' ? c.trim().toLowerCase() : c
const isBlank = (c: unknown) =>
  c === undefined || c === null || (typeof c === 'string' && c.trim() === '')
const round2 = (n: number) => Math.round(n * 100) / 100

// Clean summary sheet (Sheet2 style): header row with "Route" + "Total" columns.
function trySummary(rows: unknown[][]): Zone[] | null {
  for (let i = 0; i < rows.length; i++) {
    const header = rows[i].map(lower)
    const routeCol = header.findIndex((c) => c === 'route')
    const totalCol = header.findIndex((c) => c === 'total')
    if (routeCol === -1 || totalCol === -1) continue

    const cityCol = header.findIndex((c) => c === 'city')
    const zones: Zone[] = []
    for (let j = i + 1; j < rows.length; j++) {
      const route = rows[j][routeCol]
      const total = rows[j][totalCol]
      if (
        typeof route === 'string' &&
        route.trim() &&
        typeof total === 'number'
      ) {
        zones.push({
          city: cityCol !== -1 ? String(rows[j][cityCol] ?? '') : '',
          route: route.trim(),
          amount: total,
        })
      }
    }
    if (zones.length > 0) return zones
  }
  return null
}

// Wide daily sheet (Sheet3 style): "Date" in col A, with repeating
// [Route, Amount/Day, Extra Kms/Day, Extra Kms Amount/Day, TOTAL] column groups.
// Uses the bottom totals row; falls back to summing each zone's daily TOTAL column.
function tryWide(rows: unknown[][]): Zone[] | null {
  for (let i = 0; i < rows.length; i++) {
    const header = rows[i].map(lower)
    if (header[0] !== 'date') continue

    const totalCols: number[] = []
    header.forEach((c, idx) => {
      if (c === 'total') totalCols.push(idx)
    })
    if (totalCols.length === 0) continue

    // Zone name = the first column of each group (right after the previous TOTAL).
    const groups = totalCols
      .map((t, k) => ({
        name: String(rows[i][k === 0 ? 1 : totalCols[k - 1] + 1] ?? '').trim(),
        totalCol: t,
      }))
      .filter((g) => g.name)

    // A dedicated monthly-totals row has a blank date cell + numeric totals.
    let totalsRow: unknown[] | null = null
    for (let j = i + 1; j < rows.length; j++) {
      if (
        isBlank(rows[j][0]) &&
        typeof rows[j][groups[0].totalCol] === 'number'
      ) {
        totalsRow = rows[j]
        break
      }
    }

    const zones: Zone[] = []
    for (const g of groups) {
      let amount: number | null = null
      if (totalsRow && typeof totalsRow[g.totalCol] === 'number') {
        amount = totalsRow[g.totalCol] as number
      } else {
        let sum = 0
        let any = false
        for (let j = i + 1; j < rows.length; j++) {
          if (isBlank(rows[j][0])) continue // skip totals/blank rows
          const v = rows[j][g.totalCol]
          if (typeof v === 'number') {
            sum += v
            any = true
          }
        }
        amount = any ? Math.round(sum) : null
      }
      if (amount != null) {
        zones.push({ city: '', route: g.name, amount: round2(amount) })
      }
    }
    if (zones.length > 0) return zones
  }
  return null
}

// Parse the MIS — supports both the clean summary sheet and the wide daily sheet.
async function parseMis(file: File): Promise<Zone[]> {
  const XLSX = await import('xlsx')
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], {
      header: 1,
      blankrows: false,
    })
    const summary = trySummary(rows)
    if (summary) return summary
    const wide = tryWide(rows)
    if (wide) return wide
  }
  throw new Error(
    'Could not find a summary (Route + Total) or wide (Date + zone TOTAL) sheet',
  )
}

function todayDMY() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`
}

const inr = (n: number) =>
  n.toLocaleString('en-IN', { maximumFractionDigits: 2 })

function InvoicePage() {
  const createInvoice = useAction(api.invoices.createInvoice)
  const getInvoicePdf = useAction(api.invoices.getInvoicePdf)

  const [fileName, setFileName] = useState<string | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [parseError, setParseError] = useState<string | null>(null)

  // Invoice settings + customer (prefilled from the sample buyer, editable).
  const [gstRate, setGstRate] = useState('5')
  const [itemize, setItemize] = useState(true)
  const [documentDate, setDocumentDate] = useState(todayDMY())
  const [notes, setNotes] = useState('')
  const [custName, setCustName] = useState(
    'Cmunity Innovations Private Limited',
  )
  const [custGstin, setCustGstin] = useState('06AAICC7028B1Z0')
  const [custAddr1, setCustAddr1] = useState('12th Floor, Imperia Mindspace')
  const [custAddr2, setCustAddr2] = useState('Golf Course Ext Rd, Sector 62')
  const [custCity, setCustCity] = useState('Gurugram')
  const [custState, setCustState] = useState('HARYANA')
  const [custPin, setCustPin] = useState('122001')

  const [submitting, setSubmitting] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [result, setResult] = useState<{
    serialNumber: string | null
    hashId: string | null
    total: number
  } | null>(null)

  const grandTotal = zones.reduce((s, z) => s + z.amount, 0)
  const gst = Number(gstRate) || 0
  const taxAmount = (grandTotal * gst) / 100
  const total = grandTotal + taxAmount

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setParseError(null)
    setZones([])
    setResult(null)
    try {
      const parsed = await parseMis(file)
      setZones(parsed)
      toast.success(`Parsed ${parsed.length} zone(s)`)
    } catch (err) {
      console.error(err)
      setParseError(
        err instanceof Error ? err.message : 'Could not parse the file',
      )
    }
  }

  const handleGenerate = async () => {
    if (zones.length === 0) {
      toast.error('Upload an MIS Excel first')
      return
    }
    setSubmitting(true)
    setResult(null)
    try {
      const res = await createInvoice({
        documentDate,
        notes: notes.trim() || undefined,
        gstRate: gst,
        itemize,
        customer: {
          name: custName.trim(),
          gstin: custGstin.trim() || undefined,
          billing: {
            addressLine1: custAddr1.trim(),
            addressLine2: custAddr2.trim() || undefined,
            city: custCity.trim(),
            state: custState.trim(),
            pincode: custPin.trim(),
          },
        },
        zones: zones.map((z) => ({ route: z.route, amount: z.amount })),
      })
      setResult({
        serialNumber: res.serialNumber,
        hashId: res.hashId,
        total: res.total,
      })
      toast.success(`Invoice ${res.serialNumber ?? ''} created`)
    } catch (err) {
      console.error(err)
      toast.error(
        err instanceof Error ? err.message : 'Could not create invoice',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!result?.hashId) return
    setPdfLoading(true)
    try {
      const { url } = await getInvoicePdf({ hashId: result.hashId })
      if (!url) {
        toast.error('PDF not available yet')
        return
      }
      const a = document.createElement('a')
      a.href = url
      a.target = '_blank'
      a.rel = 'noreferrer'
      a.click()
    } catch (err) {
      console.error(err)
      toast.error('Could not fetch the PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl space-y-6 p-4">
      <AppHeader />

      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <ReceiptText size={20} /> Generate invoice from MIS
      </h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Upload MIS Excel</CardTitle>
          <CardDescription>
            The summary sheet must have <b>Route</b> and <b>Total</b> columns.
            Each zone's total is summed for the invoice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent">
            <Upload size={16} />
            {fileName ?? 'Choose .xlsx file'}
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFile}
            />
          </label>
          {parseError && <p className="text-sm text-red-500">{parseError}</p>}

          {zones.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead className="text-right">Total (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zones.map((z, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{z.city}</TableCell>
                      <TableCell className="font-medium">{z.route}</TableCell>
                      <TableCell className="text-right">
                        {inr(z.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold">
                      Grand total (taxable)
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {inr(grandTotal)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  {zones.length} zones · taxable {inr(grandTotal)} · +{gst}% GST{' '}
                  {inr(taxAmount)} · <b>total {inr(total)}</b>
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">2. Customer & invoice</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label>Customer name</Label>
            <Input
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>GSTIN</Label>
            <Input
              value={custGstin}
              onChange={(e) => setCustGstin(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Invoice date (DD-MM-YYYY)</Label>
            <Input
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Address line 1</Label>
            <Input
              value={custAddr1}
              onChange={(e) => setCustAddr1(e.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Address line 2</Label>
            <Input
              value={custAddr2}
              onChange={(e) => setCustAddr2(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>City</Label>
            <Input
              value={custCity}
              onChange={(e) => setCustCity(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>State</Label>
            <Input
              value={custState}
              onChange={(e) => setCustState(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Pincode</Label>
            <Input
              value={custPin}
              onChange={(e) => setCustPin(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>GST %</Label>
            <Input
              value={gstRate}
              onChange={(e) => setGstRate(e.target.value)}
              inputMode="numeric"
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Shipment for May 2026"
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <Checkbox
              checked={itemize}
              onCheckedChange={(c) => setItemize(c === true)}
            />
            One line item per zone (uncheck for a single “Logistics Services”
            line)
          </label>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleGenerate}
          disabled={submitting || zones.length === 0}
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ReceiptText size={16} />
          )}
          Generate Swipe invoice
        </Button>
        {result && (
          <>
            <span className="text-sm">
              ✅ Created <b>{result.serialNumber ?? 'invoice'}</b> · total ₹
              {inr(result.total)}
            </span>
            {result.hashId && (
              <Button
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
              >
                {pdfLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                Download PDF
              </Button>
            )}
          </>
        )}
      </div>

      <Toaster />
    </div>
  )
}
