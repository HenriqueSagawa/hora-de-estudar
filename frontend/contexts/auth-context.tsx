'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useMe } from '@/hooks/queries/use-user'
import { isAuthenticated, removeToken } from '@/lib/auth-storage'
import type { User } from '@/types/api'
import { Spinner } from '@/components/ui/spinner'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const PUBLIC_ROUTES = ['/', '/login', '/register']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { data: user, isLoading, isError } = useMe()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
    const hasToken = isAuthenticated()

    if (!isPublicRoute && !hasToken) {
      router.push('/login')
      return
    }

    if (isError && !isPublicRoute) {
      removeToken()
      router.push('/login')
    }
  }, [mounted, pathname, isError, router])

  const logout = () => {
    removeToken()
    router.push('/login')
  }

  if (!mounted) {
    return null
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
  const hasToken = isAuthenticated()

  // Show loading for protected routes while checking auth
  if (!isPublicRoute && (isLoading || !hasToken)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthenticated: !!user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
