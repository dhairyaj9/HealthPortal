'use client'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { NotificationBell } from './notification-bell'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'

export function DashboardHeader() {
  const { data: session } = useSession()
  const user = session?.user
  const initials = user?.name
    ?.split(' ')
    ?.map((n: string) => n?.[0])
    ?.join('')
    ?.toUpperCase() ?? '?'

  return (
    <div className="flex items-center gap-3 ml-auto">
      <NotificationBell />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium">{user?.name ?? 'User'}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
            {user?.email ?? ''}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ redirectTo: '/login' })}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
