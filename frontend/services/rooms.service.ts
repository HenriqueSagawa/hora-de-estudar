import { http } from '@/lib/http'
import type {
  ApiResponse,
  CreateRoomPayload,
  PaginatedResponse,
  Room,
  RoomActivitiesParams,
  RoomActivity,
  RoomFilters,
  RoomMember,
  RoomRankingFilters,
  RoomRankingItem,
  RoomRole,
  RoomStatisticsByMember,
  RoomStatisticsOverview,
  StatisticsByDay,
  StatisticsBySubject,
  UpdateRoomPayload,
} from '@/types/api'

export const roomsService = {
  async getRooms(filters?: RoomFilters): Promise<ApiResponse<PaginatedResponse<Room>>> {
    return http.get('/rooms', filters as Record<string, string | number | boolean | undefined>)
  },

  async getRoomById(id: string): Promise<ApiResponse<Room>> {
    return http.get(`/rooms/${id}`)
  },

  async createRoom(payload: CreateRoomPayload): Promise<ApiResponse<Room>> {
    return http.post('/rooms', payload)
  },

  async updateRoom(id: string, payload: UpdateRoomPayload): Promise<ApiResponse<Room>> {
    return http.patch(`/rooms/${id}`, payload)
  },

  async deleteRoom(id: string): Promise<ApiResponse<{ message: string }>> {
    return http.delete(`/rooms/${id}`)
  },

  async joinByInviteCode(inviteCode: string): Promise<ApiResponse<Room>> {
    return http.post(`/rooms/join/${inviteCode}`)
  },

  async leaveRoom(id: string): Promise<ApiResponse<{ message: string }>> {
    return http.post(`/rooms/${id}/leave`)
  },

  // Members
  async getMembers(roomId: string): Promise<ApiResponse<RoomMember[]>> {
    return http.get(`/rooms/${roomId}/members`)
  },

  async removeMember(roomId: string, userId: string): Promise<ApiResponse<{ message: string }>> {
    return http.delete(`/rooms/${roomId}/members/${userId}`)
  },

  async updateMemberRole(roomId: string, userId: string, role: RoomRole): Promise<ApiResponse<RoomMember>> {
    return http.patch(`/rooms/${roomId}/members/${userId}`, { role })
  },

  // Ranking
  async getRanking(roomId: string, filters?: RoomRankingFilters): Promise<ApiResponse<RoomRankingItem[]>> {
    return http.get(`/rooms/${roomId}/ranking`, filters as Record<string, string | number | boolean | undefined>)
  },

  // Activities
  async getActivities(roomId: string, params?: RoomActivitiesParams): Promise<ApiResponse<PaginatedResponse<RoomActivity>>> {
    return http.get(`/rooms/${roomId}/activities`, params as Record<string, string | number | boolean | undefined>)
  },

  // Statistics
  async getStatisticsOverview(roomId: string): Promise<ApiResponse<RoomStatisticsOverview>> {
    return http.get(`/rooms/${roomId}/statistics/overview`)
  },

  async getStatisticsByMember(roomId: string): Promise<ApiResponse<RoomStatisticsByMember[]>> {
    return http.get(`/rooms/${roomId}/statistics/by-member`)
  },

  async getStatisticsByDay(roomId: string): Promise<ApiResponse<StatisticsByDay[]>> {
    return http.get(`/rooms/${roomId}/statistics/by-day`)
  },

  async getStatisticsBySubject(roomId: string): Promise<ApiResponse<StatisticsBySubject[]>> {
    return http.get(`/rooms/${roomId}/statistics/by-subject`)
  },

  // Invite code
  async regenerateInviteCode(roomId: string): Promise<ApiResponse<{ inviteCode: string }>> {
    return http.post(`/rooms/${roomId}/regenerate-invite-code`)
  },
}
