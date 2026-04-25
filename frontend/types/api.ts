// Base API response types
export interface ApiResponse<T> {
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// Auth types
export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  user?: User
}

// User types
export interface User {
  id: string
  name: string
  email: string
  username: string
  avatarUrl?: string
  bio?: string
  institution?: string
  course?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateProfilePayload {
  name?: string
  username?: string
  avatarUrl?: string
  bio?: string
  institution?: string
  course?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

// Study Session types
export type StudySessionSource = 'MANUAL' | 'TIMER'
export type StudyType = 'READING' | 'EXERCISES' | 'VIDEO' | 'REVIEW' | 'PROJECT' | 'OTHER'
export type FocusLevelOption = 'LOW' | 'MEDIUM' | 'HIGH'
export type FocusLevelValue = 1 | 2 | 3 | 4 | 5
export type TimerStatus = 'RUNNING' | 'PAUSED' | 'FINISHED' | 'CANCELLED'

export interface StudySession {
  id: string
  userId: string
  title: string
  description?: string
  subject: string
  studyType: StudyType
  source: StudySessionSource
  durationSeconds: number
  studyDate: string
  focusLevel?: FocusLevelValue | null
  roomId?: string
  room?: Room
  timerStatus?: TimerStatus
  startedAt?: string
  pausedAt?: string
  finishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateManualSessionPayload {
  title: string
  description?: string
  subject: string
  studyType: StudyType
  durationSeconds: number
  studyDate: string
  focusLevel?: FocusLevelValue | null
  roomId?: string
}

export interface UpdateSessionPayload {
  title?: string
  description?: string
  subject?: string
  studyType?: StudyType
  durationSeconds?: number
  studyDate?: string
  focusLevel?: FocusLevelValue | null
}

export interface StartTimerPayload {
  title?: string
  subject?: string
  studyType?: StudyType
  roomId?: string
}

export interface StudySessionFilters {
  period?: 'today' | 'week' | 'month' | 'year' | 'all' | 'custom'
  startDate?: string
  endDate?: string
  subject?: string
  source?: StudySessionSource
  roomId?: string
  page?: number
  pageSize?: number
  orderBy?: 'studyDate' | 'durationSeconds' | 'createdAt'
  orderDirection?: 'asc' | 'desc'
}

// Statistics types
export interface StatisticsOverview {
  totalSeconds: number
  totalHours: number
  totalSessions: number
  averagePerSession: number
  streak: number
  topSubject?: string
  todaySeconds?: number
  weekSeconds?: number
  monthSeconds?: number
}

export interface StatisticsBySubject {
  subject: string
  totalSeconds: number
  totalSessions: number
  percentage: number
}

export interface StatisticsByDay {
  date: string
  totalSeconds: number
  totalSessions: number
}

export interface StatisticsByWeek {
  weekStart: string
  weekEnd: string
  totalSeconds: number
  totalSessions: number
}

export interface StatisticsByMonth {
  month: string
  year: number
  totalSeconds: number
  totalSessions: number
}

export interface HeatmapData {
  date: string
  count: number
  level: number
}

export interface StatisticsFilters {
  period?: 'week' | 'month' | 'year' | 'all' | 'custom'
  startDate?: string
  endDate?: string
  roomId?: string
}

// Room types
export type RoomVisibility = 'PUBLIC' | 'PRIVATE'
export type RoomRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export interface Room {
  id: string
  name: string
  description?: string
  coverImageUrl?: string
  visibility: RoomVisibility
  inviteCode: string
  ownerId: string
  owner?: User
  membersCount?: number
  myRole?: RoomRole
  createdAt: string
  updatedAt: string
}

export interface CreateRoomPayload {
  name: string
  description?: string
  coverImageUrl?: string
  visibility: RoomVisibility
}

export interface UpdateRoomPayload {
  name?: string
  description?: string
  coverImageUrl?: string
  visibility?: RoomVisibility
}

export interface RoomMember {
  id: string
  userId: string
  roomId: string
  role: RoomRole
  user: User
  joinedAt: string
}

export interface RoomRankingItem {
  position: number
  userId: string
  user?: Partial<User>
  name?: string
  username?: string
  avatarUrl?: string
  totalSeconds: number
  totalSessions: number
}

export interface RoomActivity {
  id: string
  roomId: string
  userId: string
  user: User
  type: 'SESSION_COMPLETED' | 'MEMBER_JOINED' | 'MEMBER_LEFT' | 'ROLE_CHANGED'
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface RoomStatisticsOverview {
  totalSeconds: number
  totalSessions: number
  totalMembers: number
  averagePerMember: number
  topContributor?: User
}

export interface RoomStatisticsByMember {
  userId: string
  user: User
  totalSeconds: number
  totalSessions: number
  percentage: number
}

export interface RoomFilters {
  search?: string
  visibility?: RoomVisibility
  page?: number
  pageSize?: number
}

export interface RoomRankingFilters {
  period?: 'today' | 'week' | 'month' | 'year' | 'all' | 'custom'
  startDate?: string
  endDate?: string
  source?: StudySessionSource
}

export interface RoomActivitiesParams {
  page?: number
  pageSize?: number
}
