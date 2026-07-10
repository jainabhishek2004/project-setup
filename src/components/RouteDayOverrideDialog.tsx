import { useState } from 'react'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'
import { Loader2, Truck } from 'lucide-react'

import { api } from '~/convex/_generated/api'
import { Id } from '~/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export type DayOverride = {
  vehicleRegistration: string
  source: 'own_substitute' | 'third_party'
  trackable: boolean
  vendorName?: string
  vendorCost?: number
  manualKm?: number
  reason?: string
  notes?: string
} | null

// Indian vehicle registration, e.g. DL51GD8989, HR55AU0462, UP16AT0031,
// DL1LAK9247 — 2 letters + 1-2 digits + 1-3 letters + 4 digits.
const REG_RE = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/
const cleanReg = (s: string) => s.trim().replace(/[\s-]/g, '').toUpperCase()

export function RouteDayOverrideDialog({
  routeId,
  date,
  defaultVehicle,
  override,
}: {
  routeId: Id<'routes'>
  date: string
  defaultVehicle: string
  override: DayOverride
}) {
  const setOverride = useMutation(api.overrides.set)
  const clearOverride = useMutation(api.overrides.clear)

  const [open, setOpen] = useState(false)
  const [vehicle, setVehicle] = useState(override?.vehicleRegistration ?? '')
  const [thirdParty, setThirdParty] = useState(
    override ? !override.trackable : false,
  )
  const [vendorName, setVendorName] = useState(override?.vendorName ?? 'Porter')
  const [vendorCost, setVendorCost] = useState(
    override?.vendorCost != null ? String(override.vendorCost) : '',
  )
  const [manualKm, setManualKm] = useState(
    override?.manualKm != null ? String(override.manualKm) : '',
  )
  const [reason, setReason] = useState(override?.reason ?? '')
  const [notes, setNotes] = useState(override?.notes ?? '')
  const [saving, setSaving] = useState(false)

  const num = (s: string) => {
    const n = Number(s)
    return s.trim() === '' || Number.isNaN(n) ? undefined : n
  }

  const handleSave = async () => {
    // Validate depending on the vehicle type.
    if (thirdParty) {
      if (!vendorName.trim()) {
        toast.error('Enter the vendor name (e.g. Porter)')
        return
      }
    } else {
      if (!REG_RE.test(cleanReg(vehicle))) {
        toast.error('Enter a valid vehicle number, e.g. DL51GD8989')
        return
      }
    }

    // Own substitute → the (validated) registration; third-party → the vehicle
    // if given, else the vendor name as the label.
    const vehicleRegistration = thirdParty
      ? vehicle.trim()
        ? cleanReg(vehicle)
        : vendorName.trim()
      : cleanReg(vehicle)

    setSaving(true)
    try {
      await setOverride({
        routeId,
        date,
        vehicleRegistration,
        trackable: !thirdParty,
        vendorName: thirdParty ? vendorName.trim() : undefined,
        vendorCost: thirdParty ? num(vendorCost) : undefined,
        manualKm: thirdParty ? num(manualKm) : undefined,
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      toast.success('Vehicle updated for this day')
      setOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('Could not save override')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    setSaving(true)
    try {
      await clearOverride({ routeId, date })
      toast.success('Reverted to the default vehicle')
      setOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('Could not clear override')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Truck className="size-4" /> Change vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change vehicle for {date}</DialogTitle>
          <DialogDescription>
            Default vehicle is <b>{defaultVehicle}</b>. Set the vehicle that ran
            this day — a breakdown substitute (tracked live) or a third-party
            vehicle (manual).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={thirdParty}
              onCheckedChange={(c) => setThirdParty(c === true)}
            />
            Third-party vehicle (no IoT, e.g. Porter) — tracked manually
          </label>

          {!thirdParty ? (
            <div className="grid gap-1.5">
              <Label>Substitute vehicle number</Label>
              <Input
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value.toUpperCase())}
                placeholder="DL51GD8989"
                autoCapitalize="characters"
              />
              <p className="text-muted-foreground text-xs">
                Must be a valid registration — it's tracked live via IoT.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 rounded-lg border p-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="text-xs">Vendor name</Label>
                <Input
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="Porter"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Vendor cost (₹)</Label>
                <Input
                  value={vendorCost}
                  onChange={(e) => setVendorCost(e.target.value)}
                  inputMode="numeric"
                  placeholder="4500"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Km driven (manual)</Label>
                <Input
                  value={manualKm}
                  onChange={(e) => setManualKm(e.target.value)}
                  inputMode="numeric"
                  placeholder="optional"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Vehicle number (optional)</Label>
                <Input
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value.toUpperCase())}
                  placeholder="if known"
                />
              </div>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label className="text-xs">Reason</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Breakdown"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {override ? (
              <Button variant="ghost" onClick={handleClear} disabled={saving}>
                Clear override
              </Button>
            ) : (
              <span />
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
