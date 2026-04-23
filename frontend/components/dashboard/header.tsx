'use client'

import { useAuth } from '@/contexts/auth-context'
import { MobileSidebar } from './mobile-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

interface DashboardHeaderProps {
  title?: string
  description?: string
  children?: React.ReactNode
}

export function DashboardHeader({ title, description, children }: DashboardHeaderProps) {
  const { user } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <MobileSidebar />
          <div>
            {title ? (
              <>
                <h1 className="text-lg font-semibold text-foreground lg:text-xl">{title}</h1>
                {description && (
                  <p className="hidden text-sm text-muted-foreground sm:block">{description}</p>
                )}
              </>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">
                  {getGreeting()}, <span className="font-medium text-foreground">{user?.name?.split(' ')[0] || 'Estudante'}</span>
                </p>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Pronto para mais uma sessão de estudos?
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
