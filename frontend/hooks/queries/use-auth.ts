'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { setToken, removeToken } from '@/lib/auth-storage'
import type { LoginPayload, RegisterPayload } from '@/types/api'

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (response) => {
      setToken(response.data.token)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return () => {
    removeToken()
    queryClient.clear()
    window.location.href = '/login'
  }
}
