import { http } from '@/lib/http'
import type { ApiResponse, AuthResponse, LoginPayload, RegisterPayload } from '@/types/api'

export const authService = {
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    return http.post('/auth/login', payload)
  },

  async register(payload: RegisterPayload): Promise<ApiResponse<{ message: string }>> {
    return http.post('/auth/register', payload)
  },
}
