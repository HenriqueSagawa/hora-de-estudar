'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { roomsService } from '@/services/rooms.service'
import type {
  CreateRoomPayload,
  RoomActivitiesParams,
  RoomFilters,
  RoomRankingFilters,
  RoomRole,
  UpdateRoomPayload,
} from '@/types/api'

export function useRooms(filters?: RoomFilters) {
  return useQuery({
    queryKey: ['rooms', filters],
    queryFn: async () => {
      const response = await roomsService.getRooms(filters)
      return response.data
    },
  })
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      const response = await roomsService.getRoomById(id)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRoomPayload) => roomsService.createRoom(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    },
  })
}

export function useUpdateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRoomPayload }) =>
      roomsService.updateRoom(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      queryClient.invalidateQueries({ queryKey: ['room', variables.id] })
    },
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => roomsService.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    },
  })
}

export function useJoinRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteCode: string) => roomsService.joinByInviteCode(inviteCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    },
  })
}

export function useLeaveRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => roomsService.leaveRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    },
  })
}

// Members
export function useRoomMembers(roomId: string) {
  return useQuery({
    queryKey: ['room-members', roomId],
    queryFn: async () => {
      const response = await roomsService.getMembers(roomId)
      return response.data
    },
    enabled: !!roomId,
  })
}

export function useRemoveMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roomId, userId }: { roomId: string; userId: string }) =>
      roomsService.removeMember(roomId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['room-members', variables.roomId] })
      queryClient.invalidateQueries({ queryKey: ['room', variables.roomId] })
    },
  })
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roomId, userId, role }: { roomId: string; userId: string; role: RoomRole }) =>
      roomsService.updateMemberRole(roomId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['room-members', variables.roomId] })
    },
  })
}

// Ranking
export function useRoomRanking(roomId: string, filters?: RoomRankingFilters) {
  return useQuery({
    queryKey: ['room-ranking', roomId, filters],
    queryFn: async () => {
      const response = await roomsService.getRanking(roomId, filters)
      return response.data
    },
    enabled: !!roomId,
  })
}

// Activities
export function useRoomActivities(roomId: string, params?: RoomActivitiesParams) {
  return useQuery({
    queryKey: ['room-activities', roomId, params],
    queryFn: async () => {
      const response = await roomsService.getActivities(roomId, params)
      return response.data
    },
    enabled: !!roomId,
  })
}

// Statistics
export function useRoomStatisticsOverview(roomId: string) {
  return useQuery({
    queryKey: ['room-statistics', 'overview', roomId],
    queryFn: async () => {
      const response = await roomsService.getStatisticsOverview(roomId)
      return response.data
    },
    enabled: !!roomId,
  })
}

export function useRoomStatisticsByMember(roomId: string) {
  return useQuery({
    queryKey: ['room-statistics', 'by-member', roomId],
    queryFn: async () => {
      const response = await roomsService.getStatisticsByMember(roomId)
      return response.data
    },
    enabled: !!roomId,
  })
}

export function useRoomStatisticsByDay(roomId: string) {
  return useQuery({
    queryKey: ['room-statistics', 'by-day', roomId],
    queryFn: async () => {
      const response = await roomsService.getStatisticsByDay(roomId)
      return response.data
    },
    enabled: !!roomId,
  })
}

export function useRoomStatisticsBySubject(roomId: string) {
  return useQuery({
    queryKey: ['room-statistics', 'by-subject', roomId],
    queryFn: async () => {
      const response = await roomsService.getStatisticsBySubject(roomId)
      return response.data
    },
    enabled: !!roomId,
  })
}

// Invite code
export function useRegenerateInviteCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) => roomsService.regenerateInviteCode(roomId),
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ['room', roomId] })
    },
  })
}
