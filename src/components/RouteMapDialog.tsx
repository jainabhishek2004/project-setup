import { lazy, Suspense, useState } from 'react'
import { Loader2, Map as MapIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// Lazy-loaded so maplibre-gl is never pulled into the SSR module graph; it
// loads on the client only when the dialog is opened.
const RouteMap = lazy(() =>
  import('@/components/RouteMap').then((m) => ({ default: m.RouteMap })),
)

type Stop = {
  name: string
  order: number
  targetLat: number
  targetLng: number
  status: 'pending' | 'polling' | 'captured' | 'missed'
  odometer?: number
}

export function RouteMapDialog({
  routeName,
  vehicleRegistration,
  stops,
}: {
  routeName: string
  vehicleRegistration: string
  stops: Stop[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MapIcon className="size-4" /> Map
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{routeName}</DialogTitle>
          <DialogDescription>
            Drop points and live location for {vehicleRegistration}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <Suspense
            fallback={
              <div className="flex h-[60vh] max-h-[480px] items-center justify-center">
                <Loader2 className="text-muted-foreground size-6 animate-spin" />
              </div>
            }
          >
            <RouteMap vehicleRegistration={vehicleRegistration} stops={stops} />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  )
}
