import { Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { Settings } from 'lucide-react'

import { api } from '~/convex/_generated/api'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { UserProfile } from '@/components/UserProfile'
import { SignOutButton } from '@/components/client'

export function AppHeader() {
  const user = useSuspenseQuery(convexQuery(api.auth.getCurrentUser, {}))

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          location.reload()
        },
      },
    })
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
      <UserProfile user={user.data} />
      <nav className="flex items-center gap-1">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/" activeOptions={{ exact: true }}>
            Dashboard
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/routes">Routes</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/invoice">Invoice</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/settings">
            <Settings size={16} className="mr-1" />
            Settings
          </Link>
        </Button>
        <SignOutButton onClick={handleSignOut} />
      </nav>
    </header>
  )
}
