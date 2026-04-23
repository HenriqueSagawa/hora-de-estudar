import { http } from '@/lib/http'
import type {
  ApiResponse,
  CreateManualSessionPayload,
  PaginatedResponse,
  StartTimerPayload,
  StudySession,
  StudySessionFilters,
  UpdateSessionPayload,
} from '@/types/api'

export const studySessionsService = {
  async getStudySessions(filters?: StudySessionFilters): Promise<ApiResponse<PaginatedResponse<StudySession>>> {
    return http.get('/study-sessions', filters as Record<string, string | number | boolean | undefined>)
  },

  async getStudySessionById(id: string): Promise<ApiResponse<StudySession>> {
    return http.get(`/study-sessions/${id}`)
  },

  async createManualSession(payload: CreateManualSessionPayload): Promise<ApiResponse<StudySession>> {
    return http.post('/study-sessions/manual', payload)
  },

  async updateSession(id: string, payload: UpdateSessionPayload): Promise<ApiResponse<StudySession>> {
    return http.patch(`/study-sessions/${id}`, payload)
  },

  async deleteSession(id: string): Promise<ApiResponse<{ message: string }>> {
    return http.delete(`/study-sessions/${id}`)
  },

  // Timer endpoints
  async startTimer(payload?: StartTimerPayload): Promise<ApiResponse<StudySession>> {
    return http.post('/study-sessions/timer/start', payload)
  },

  async pauseTimer(id: string): Promise<ApiResponse<StudySession>> {
    return http.post(`/study-sessions/timer/${id}/pause`)
  },

  async resumeTimer(id: string): Promise<ApiResponse<StudySession>> {
    return http.post(`/study-sessions/timer/${id}/resume`)
  },

  async finishTimer(id: string): Promise<ApiResponse<StudySession>> {
    return http.post(`/study-sessions/timer/${id}/finish`)
  },

  async cancelTimer(id: string): Promise<ApiResponse<StudySession>> {
    return http.post(`/study-sessions/timer/${id}/cancel`)
  },

  async getActiveTimer(): Promise<ApiResponse<StudySession | null>> {
    return http.get('/study-sessions/timer/active')
  },
}
