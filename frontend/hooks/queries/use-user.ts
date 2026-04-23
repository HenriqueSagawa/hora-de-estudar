'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/services/users.service'
import { removeToken, isAuthenticated } from '@/lib/auth-storage'
import type { ChangePasswordPayload, UpdateProfilePayload } from '@/types/api'

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await usersService.getMe()
      return response.data
    },
    enabled: typeof window !== 'undefined' && isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => usersService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => usersService.changePassword(payload),
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => usersService.deleteAccount(),
    onSuccess: () => {
      removeToken()
      queryClient.clear()
      window.location.href = '/'
    },
  })
}
