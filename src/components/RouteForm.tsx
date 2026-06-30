import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '~/convex/_generated/api'
import { Id } from '~/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type StopDraft = {
  name: string
  lat: string
  lng: string
  radius: string
}

const emptyStop = (): StopDraft => ({
  name: '',
  lat: '',
  lng: '',
  radius: '100',
})

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export type RouteFormInitial = {
  id: Id<'routes'>
  name: string
  vehicleRegistration: string
  activeStartMinutes?: number
  activeEndMinutes?: number
  stops: Array<{
    name: string
    lat: number
    lng: number
    radiusMeters?: number
  }>
}

export function RouteForm({ initial }: { initial?: RouteFormInitial }) {
  const navigate = useNavigate()
  const create = useMutation(api.routes.create)
  const update = useMutation(api.routes.update)

  const [name, setName] = useState(initial?.name ?? '')
  const [vehicle, setVehicle] = useState(initial?.vehicleRegistration ?? '')
  const [activeStart, setActiveStart] = useState(
    initial?.activeStartMinutes != null
      ? minutesToTime(initial.activeStartMinutes)
      : '17:00',
  )
  const [activeEnd, setActiveEnd] = useState(
    initial?.activeEndMinutes != null
      ? minutesToTime(initial.activeEndMinutes)
      : '21:00',
  )
  const [stops, setStops] = useState<StopDraft[]>(
    initial && initial.stops.length > 0
      ? initial.stops.map((s) => ({
          name: s.name,
          lat: String(s.lat),
          lng: String(s.lng),
          radius: String(s.radiusMeters ?? 100),
        }))
      : [emptyStop()],
  )
  const [saving, setSaving] = useState(false)

  const updateStop = (index: number, patch: Partial<StopDraft>) =>
    setStops((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    )
  const addStop = () => setStops((prev) => [...prev, emptyStop()])
  const removeStop = (index: number) =>
    setStops((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !vehicle.trim()) {
      toast.error('Route name and vehicle number are required')
      return
    }
    if (!activeStart || !activeEnd) {
      toast.error('Set the active-hours window')
      return
    }

    const parsedStops: Array<{
      name: string
      lat: number
      lng: number
      radiusMeters: number
    }> = []
    for (const s of stops) {
      const lat = Number(s.lat)
      const lng = Number(s.lng)
      const radius = Number(s.radius)
      if (
        !s.name.trim() ||
        Number.isNaN(lat) ||
        Number.isNaN(lng) ||
        Number.isNaN(radius) ||
        radius <= 0
      ) {
        toast.error('Each drop point needs a name, valid lat/lng, and radius')
        return
      }
      parsedStops.push({ name: s.name.trim(), lat, lng, radiusMeters: radius })
    }
    if (parsedStops.length === 0) {
      toast.error('Add at least one drop point')
      return
    }

    const payload = {
      name,
      vehicleRegistration: vehicle,
      activeStartMinutes: timeToMinutes(activeStart),
      activeEndMinutes: timeToMinutes(activeEnd),
      stops: parsedStops,
    }

    setSaving(true)
    try {
      if (initial) {
        await update({ id: initial.id, ...payload })
        toast.success('Route updated')
      } else {
        await create(payload)
        toast.success('Route created')
      }
      await navigate({ to: '/routes' })
    } catch (err) {
      toast.error('Could not save route')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{initial ? 'Edit route' : 'New route'}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Route name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Evening delivery loop"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vehicle">Vehicle number</Label>
            <Input
              id="vehicle"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="DL51GD8989"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="active-start">Active from</Label>
            <Input
              id="active-start"
              type="time"
              value={activeStart}
              onChange={(e) => setActiveStart(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="active-end">Active until</Label>
            <Input
              id="active-end"
              type="time"
              value={activeEnd}
              onChange={(e) => setActiveEnd(e.target.value)}
            />
          </div>
          <p className="text-muted-foreground text-xs sm:col-span-2">
            The vehicle is monitored only during these hours. Use one route per
            round (e.g. 5–9 PM and 2–5 AM as two routes) so distance driven
            between rounds isn't counted.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Drop points</CardTitle>
          <Button type="button" variant="secondary" size="sm" onClick={addStop}>
            <Plus size={16} /> Add drop point
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {stops.map((stop, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_1fr_auto_auto] sm:items-end"
            >
              <div className="grid gap-1">
                <Label className="text-xs">Location name</Label>
                <Input
                  value={stop.name}
                  onChange={(e) => updateStop(index, { name: e.target.value })}
                  placeholder="Warehouse A"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Latitude</Label>
                <Input
                  value={stop.lat}
                  onChange={(e) => updateStop(index, { lat: e.target.value })}
                  placeholder="28.5355"
                  inputMode="decimal"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Longitude</Label>
                <Input
                  value={stop.lng}
                  onChange={(e) => updateStop(index, { lng: e.target.value })}
                  placeholder="77.3910"
                  inputMode="decimal"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Radius (m)</Label>
                <Input
                  value={stop.radius}
                  onChange={(e) =>
                    updateStop(index, { radius: e.target.value })
                  }
                  placeholder="100"
                  inputMode="numeric"
                  className="w-24"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeStop(index)}
                disabled={stops.length === 1}
                className="text-muted-foreground hover:text-red-500"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : initial ? (
            'Save changes'
          ) : (
            'Create route'
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate({ to: '/routes' })}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
