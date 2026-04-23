'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { studySessionsService } from '@/services/study-sessions.service'
import type {
  CreateManualSessionPayload,
  StartTimerPayload,
  StudySessionFilters,
  UpdateSessionPayload,
} from '@/types/api'

export function useStudySessions(filters?: StudySessionFilters) {
  return useQuery({
    queryKey: ['study-sessions', filters],
    queryFn: async () => {
      const response = await studySessionsService.getStudySessions(filters)
      return response.data
    },
  })
}

export function useStudySession(id: string) {
  return useQuery({
    queryKey: ['study-session', id],
    queryFn: async () => {
      const response = await studySessionsService.getStudySessionById(id)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateManualSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateManualSessionPayload) => studySessionsService.createManualSession(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      if (variables.roomId) {
        queryClient.invalidateQueries({ queryKey: ['room-ranking', variables.roomId] })
        queryClient.invalidateQueries({ queryKey: ['room-statistics', variables.roomId] })
        queryClient.invalidateQueries({ queryKey: ['room-activities', variables.roomId] })
      }
    },
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSessionPayload }) =>
      studySessionsService.updateSession(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['study-session', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
    },
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => studySessionsService.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
    },
  })
}

// Timer hooks
export function useActiveTimer() {
  return useQuery({
    queryKey: ['active-timer'],
    queryFn: async () => {
      const response = await studySessionsService.getActiveTimer()
      return response.data
    },
    refetchInterval: 1000, // Refetch every second to keep timer in sync
  })
}

export function useStartTimer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload?: StartTimerPayload) => studySessionsService.startTimer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-timer'] })
    },
  })
}

export function usePauseTimer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => studySessionsService.pauseTimer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-timer'] })
    },
  })
}

export function useResumeTimer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => studySessionsService.resumeTimer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-timer'] })
    },
  })
}

export function useFinishTimer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => studySessionsService.finishTimer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-timer'] })
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
    },
  })
}

export function useCancelTimer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => studySessionsService.cancelTimer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-timer'] })
    },
  })
}
