import { v } from 'convex/values'
import { action } from './_generated/server'
import { api } from './_generated/api'

const SWIPE_URL = 'https://app.getswipe.in/api/partner/v2/doc'
const SAC_LOGISTICS = '998711'

const round2 = (n: number) => Math.round(n * 100) / 100

const addressInput = v.object({
  addressLine1: v.string(),
  addressLine2: v.optional(v.string()),
  city: v.string(),
  state: v.string(),
  pincode: v.string(),
})

// Fetch a created invoice's PDF from Swipe, stash it in Convex storage, and
// return a downloadable URL.
export const getInvoicePdf = action({
  args: { hashId: v.string() },
  handler: async (ctx, args) => {
    await ctx.runQuery(api.auth.getCurrentUser, {})
    const token = process.env.SWIPE_API_TOKEN
    if (!token) {
      throw new Error('SWIPE_API_TOKEN environment variable is not set')
    }
    const res = await fetch(
      `https://app.getswipe.in/api/partner/v2/doc/pdf/${encodeURIComponent(args.hashId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf',
        },
      },
    )
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Swipe PDF error (${res.status}): ${text}`)
    }
    const blob = await res.blob()
    const storageId = await ctx.storage.store(blob)
    return { url: await ctx.storage.getUrl(storageId) }
  },
})

// Build the Swipe document payload from parsed MIS zone totals and create the
// invoice via the Swipe partner API. Auth-guarded; token from env.
export const createInvoice = action({
  args: {
    documentDate: v.string(), // DD-MM-YYYY
    notes: v.optional(v.string()),
    gstRate: v.number(), // e.g. 5
    itemize: v.boolean(), // one line per zone, or a single total line
    customer: v.object({
      name: v.string(),
      gstin: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      billing: addressInput,
    }),
    zones: v.array(v.object({ route: v.string(), amount: v.number() })),
  },
  handler: async (ctx, args) => {
    // Require an authenticated user before creating an invoice.
    await ctx.runQuery(api.auth.getCurrentUser, {})

    const token = process.env.SWIPE_API_TOKEN
    if (!token) {
      throw new Error('SWIPE_API_TOKEN environment variable is not set')
    }
    if (args.zones.length === 0) {
      throw new Error('No zones to invoice')
    }

    const makeItem = (name: string, net: number, idx: number) => {
      const netAmount = round2(net)
      const withTax = round2(net * (1 + args.gstRate / 100))
      return {
        id: `item-${idx + 1}`,
        name,
        item_type: 'Service',
        hsn_code: SAC_LOGISTICS,
        quantity: 1,
        unit_price: netAmount,
        tax_rate: args.gstRate,
        price_with_tax: withTax,
        net_amount: netAmount,
        total_amount: withTax,
      }
    }

    const items = args.itemize
      ? args.zones.map((z, i) =>
          makeItem(`Logistics Services - ${z.route}`, z.amount, i),
        )
      : [
          makeItem(
            'Logistics Services',
            args.zones.reduce((sum, z) => sum + z.amount, 0),
            0,
          ),
        ]

    const address = {
      addr_id_v2: 'addr1',
      address_line1: args.customer.billing.addressLine1,
      address_line2: args.customer.billing.addressLine2 ?? '',
      city: args.customer.billing.city,
      state: args.customer.billing.state,
      country: 'India',
      pincode: args.customer.billing.pincode,
    }

    const payload = {
      document_type: 'invoice',
      document_date: args.documentDate,
      notes: args.notes ?? '',
      party: {
        id:
          (args.customer.gstin || args.customer.name)
            .replace(/[^A-Za-z0-9]/g, '')
            .slice(0, 40) || 'customer',
        type: 'customer',
        name: args.customer.name,
        company_name: args.customer.name,
        country_code: '91',
        phone_number: args.customer.phone ?? '',
        email: args.customer.email ?? '',
        gstin: args.customer.gstin ?? '',
        billing_address: address,
      },
      items,
    }

    const res = await fetch(SWIPE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const body = (await res.json().catch(() => null)) as {
      success?: boolean
      message?: string
      data?: {
        hash_id?: string
        serial_number?: string
        irn?: string
        qr_code?: string
      }
    } | null

    if (!res.ok || !body?.success) {
      // Surface Swipe's detailed validation payload so the exact field is visible.
      throw new Error(
        `Swipe API error (${res.status}): ${body?.message ?? 'unknown error'} :: ${JSON.stringify(body ?? {})}`,
      )
    }

    const taxable = round2(args.zones.reduce((s, z) => s + z.amount, 0))
    return {
      serialNumber: body.data?.serial_number ?? null,
      hashId: body.data?.hash_id ?? null,
      irn: body.data?.irn ?? null,
      taxable,
      total: round2(taxable * (1 + args.gstRate / 100)),
    }
  },
})
