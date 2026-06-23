import { createFileRoute } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { convexQuery } from '@convex-dev/react-query'

import { api } from '~/convex/_generated/api'
import { AppHeader } from '@/components/AppHeader'
import { RouteForm } from '@/components/RouteForm'

export const Route = createFileRoute('/_authed/routes/new')({
  component: NewRoute,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.auth.getCurrentUser, {}),
    )
  },
})

function NewRoute() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl space-y-6 p-4">
      <AppHeader />
      <RouteForm />
      <Toaster />
    </div>
  )
}
