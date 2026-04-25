import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
  }
  if (minutes > 0) {
    return secs > 0 ? `${minutes}min ${secs}s` : `${minutes}min`
  }
  return `${secs}s`
}

export function formatDurationLong(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts: string[] = []
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`)
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`)
  if (secs > 0 && hours === 0) parts.push(`${secs} ${secs === 1 ? 'segundo' : 'segundos'}`)

  return parts.join(' e ') || '0 segundos'
}

export function formatTimerDisplay(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
  }
  return `${pad(minutes)}:${pad(secs)}`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR })
}

export function formatHours(seconds: number): string {
  const hours = seconds / 3600
  return hours.toFixed(1).replace('.', ',') + 'h'
}

export function formatPercentage(value: number): string {
  return value.toFixed(1).replace('.', ',') + '%'
}

export const STUDY_TYPE_LABELS: Record<string, string> = {
  READING: 'Leitura',
  EXERCISES: 'Exercícios',
  VIDEO: 'Vídeo-aula',
  REVIEW: 'Revisão',
  PROJECT: 'Projeto',
  OTHER: 'Outro',
}

export const FOCUS_LEVEL_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'] as const

export const FOCUS_LEVEL_LABELS: Record<string, string> = {
  LOW: 'Baixo',
  MEDIUM: 'Médio',
  HIGH: 'Alto',
  1: 'Baixo',
  2: 'Baixo',
  3: 'Médio',
  4: 'Alto',
  5: 'Alto',
}

export const ROOM_VISIBILITY_LABELS: Record<string, string> = {
  PUBLIC: 'Pública',
  PRIVATE: 'Privada',
}

export const ROOM_ROLE_LABELS: Record<string, string> = {
  OWNER: 'Dono',
  ADMIN: 'Admin',
  MEMBER: 'Membro',
}

export const SESSION_SOURCE_LABELS: Record<string, string> = {
  MANUAL: 'Manual',
  TIMER: 'Cronômetro',
}
