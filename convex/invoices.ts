import { v } from 'convex/values'
import { action } from './_generated/server'
import { api } from './_generated/api'

const SWIPE_BASE = 'https://app.getswipe.in/api/partner'
const SWIPE_URL = `${SWIPE_BASE}/v2/doc`
const SAC_LOGISTICS = '998711'

const round2 = (n: number) => Math.round(n * 100) / 100

// Swipe's create-doc party.id is an EXTERNAL customer_id. Customers created in
// the Swipe UI have no external id (only an internal swipe_id), so we can't
// reference them directly. This resolves a stable external id (the GSTIN): if a
// matching customer already exists, map GSTIN -> its swipe_id first so party.id
// links to it; otherwise the GSTIN is used to create a new customer.
async function resolvePartyId(
  token: string,
  customer: { name: string; gstin?: string },
): Promise<string> {
  const externalId =
    (customer.gstin || customer.name)
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 40) || 'customer'

  // 1. Find the existing customer's internal swipe_id (by GSTIN, else name).
  let swipeId: string | null = null
  try {
    const res = await fetch(`${SWIPE_BASE}/v2/customer/list`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
    if (res.ok) {
      const body = (await res.json().catch(() => null)) as {
        data?: { customers?: Array<Record<string, unknown>> }
      } | null
      const customers = body?.data?.customers ?? []
      const gstin = customer.gstin?.trim().toUpperCase()
      const name = customer.name.trim().toLowerCase()
      const match =
        (gstin &&
          customers.find(
            (c) =>
              String(c?.gstin ?? '')
                .trim()
                .toUpperCase() === gstin,
          )) ||
        customers.find(
          (c) =>
            String(c?.name ?? '')
              .trim()
              .toLowerCase() === name,
        )
      if (match?.swipe_id != null) swipeId = String(match.swipe_id)
    }
  } catch {
    // best effort; fall through to create-new
  }

  // 2. If it exists, map our external id -> swipe_id so party.id resolves to it.
  if (swipeId) {
    try {
      await fetch(`${SWIPE_BASE}/v2/customer/list`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          customer_mapping: [
            { customer_id: externalId, swipe_id: swipeId, force_update: true },
          ],
        }),
      })
    } catch {
      // best effort
    }
  }

  return externalId
}

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

    // Resolve a party id that links to the existing customer (mapping GSTIN ->
    // swipe_id if needed) or creates a new one.
    const partyId = await resolvePartyId(token, args.customer)

    const payload = {
      document_type: 'invoice',
      document_date: args.documentDate,
      notes: args.notes ?? '',
      party: {
        id: partyId,
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
