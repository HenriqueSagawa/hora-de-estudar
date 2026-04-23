import { http } from '@/lib/http'
import type { ApiResponse, ChangePasswordPayload, UpdateProfilePayload, User } from '@/types/api'

export const usersService = {
  async getMe(): Promise<ApiResponse<User>> {
    return http.get('/users/me')
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<User>> {
    return http.patch('/users/me', payload)
  },

  async changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<{ message: string }>> {
    return http.patch('/users/me/password', payload)
  },

  async deleteAccount(): Promise<ApiResponse<{ message: string }>> {
    return http.delete('/users/me')
  },

  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    return http.get('/users', { search: query })
  },
}
