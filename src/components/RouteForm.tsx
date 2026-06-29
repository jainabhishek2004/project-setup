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
  // "HH:mm" from <input type="time">
  time: string
}

const emptyStop = (): StopDraft => ({ name: '', lat: '', lng: '', time: '' })

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

type Point = { name: string; lat: number; lng: number; expectedMinutes: number }

export type RouteFormInitial = {
  id: Id<'routes'>
  name: string
  vehicleRegistration: string
  start?: Point | null
  stops: Array<Point>
}

function pointToDraft(p?: Point | null): StopDraft {
  if (!p) return emptyStop()
  return {
    name: p.name,
    lat: String(p.lat),
    lng: String(p.lng),
    time: minutesToTime(p.expectedMinutes),
  }
}

export function RouteForm({ initial }: { initial?: RouteFormInitial }) {
  const navigate = useNavigate()
  const create = useMutation(api.routes.create)
  const update = useMutation(api.routes.update)

  const [name, setName] = useState(initial?.name ?? '')
  const [vehicle, setVehicle] = useState(initial?.vehicleRegistration ?? '')
  const [start, setStart] = useState<StopDraft>(pointToDraft(initial?.start))
  const [stops, setStops] = useState<StopDraft[]>(
    initial && initial.stops.length > 0
      ? initial.stops.map((s) => pointToDraft(s))
      : [emptyStop()],
  )
  const [saving, setSaving] = useState(false)

  const updateStart = (patch: Partial<StopDraft>) =>
    setStart((prev) => ({ ...prev, ...patch }))

  const updateStop = (index: number, patch: Partial<StopDraft>) => {
    setStops((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    )
  }
  const addStop = () => setStops((prev) => [...prev, emptyStop()])
  const removeStop = (index: number) =>
    setStops((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !vehicle.trim()) {
      toast.error('Route name and vehicle number are required')
      return
    }

    const startLat = Number(start.lat)
    const startLng = Number(start.lng)
    if (
      !start.name.trim() ||
      !start.time ||
      Number.isNaN(startLat) ||
      Number.isNaN(startLng)
    ) {
      toast.error('Start point needs a name, departure time, and valid lat/lng')
      return
    }
    const parsedStart: Point = {
      name: start.name.trim(),
      lat: startLat,
      lng: startLng,
      expectedMinutes: timeToMinutes(start.time),
    }

    const parsedStops: Array<Point> = []
    for (const s of stops) {
      const lat = Number(s.lat)
      const lng = Number(s.lng)
      if (!s.name.trim() || !s.time || Number.isNaN(lat) || Number.isNaN(lng)) {
        toast.error('Each drop point needs a name, time, and valid lat/lng')
        return
      }
      parsedStops.push({
        name: s.name.trim(),
        lat,
        lng,
        expectedMinutes: timeToMinutes(s.time),
      })
    }
    if (parsedStops.length === 0) {
      toast.error('Add at least one drop point')
      return
    }

    setSaving(true)
    try {
      if (initial) {
        await update({
          id: initial.id,
          name,
          vehicleRegistration: vehicle,
          start: parsedStart,
          stops: parsedStops,
        })
        toast.success('Route updated')
      } else {
        await create({
          name,
          vehicleRegistration: vehicle,
          start: parsedStart,
          stops: parsedStops,
        })
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
              placeholder="Morning delivery loop"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vehicle">Vehicle number</Label>
            <Input
              id="vehicle"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="MH12AB1234"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Start point</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            <div className="grid gap-1">
              <Label className="text-xs">Start / parking name</Label>
              <Input
                value={start.name}
                onChange={(e) => updateStart({ name: e.target.value })}
                placeholder="Depot / Parking"
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Latitude</Label>
              <Input
                value={start.lat}
                onChange={(e) => updateStart({ lat: e.target.value })}
                placeholder="19.0760"
                inputMode="decimal"
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Longitude</Label>
              <Input
                value={start.lng}
                onChange={(e) => updateStart({ lng: e.target.value })}
                placeholder="72.8777"
                inputMode="decimal"
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Departure time</Label>
              <Input
                type="time"
                value={start.time}
                onChange={(e) => updateStart({ time: e.target.value })}
              />
            </div>
          </div>
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
          <p className="text-muted-foreground text-xs">
            The operational day runs 5 PM–7 AM. Times from 5 PM onward are this
            evening; times before 5 PM count as the next morning.
          </p>
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
                  placeholder="19.0760"
                  inputMode="decimal"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Longitude</Label>
                <Input
                  value={stop.lng}
                  onChange={(e) => updateStop(index, { lng: e.target.value })}
                  placeholder="72.8777"
                  inputMode="decimal"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Expected time</Label>
                <Input
                  type="time"
                  value={stop.time}
                  onChange={(e) => updateStop(index, { time: e.target.value })}
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
