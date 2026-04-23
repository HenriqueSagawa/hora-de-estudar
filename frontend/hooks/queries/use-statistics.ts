'use client'

import { useQuery } from '@tanstack/react-query'
import { statisticsService } from '@/services/statistics.service'
import type { StatisticsFilters } from '@/types/api'

export function useStatisticsOverview(filters?: StatisticsFilters) {
  return useQuery({
    queryKey: ['statistics', 'overview', filters],
    queryFn: async () => {
      const response = await statisticsService.getOverview(filters)
      return response.data
    },
  })
}

export function useStatisticsBySubject(filters?: StatisticsFilters) {
  return useQuery({
    queryKey: ['statistics', 'by-subject', filters],
    queryFn: async () => {
      const response = await statisticsService.getBySubject(filters)
      return response.data
    },
  })
}

export function useStatisticsByDay(filters?: StatisticsFilters) {
  return useQuery({
    queryKey: ['statistics', 'by-day', filters],
    queryFn: async () => {
      const response = await statisticsService.getByDay(filters)
      return response.data
    },
  })
}

export function useStatisticsByWeek(filters?: StatisticsFilters) {
  return useQuery({
    queryKey: ['statistics', 'by-week', filters],
    queryFn: async () => {
      const response = await statisticsService.getByWeek(filters)
      return response.data
    },
  })
}

export function useStatisticsByMonth(filters?: StatisticsFilters) {
  return useQuery({
    queryKey: ['statistics', 'by-month', filters],
    queryFn: async () => {
      const response = await statisticsService.getByMonth(filters)
      return response.data
    },
  })
}

export function useHeatmap(filters?: StatisticsFilters) {
  return useQuery({
    queryKey: ['statistics', 'heatmap', filters],
    queryFn: async () => {
      const response = await statisticsService.getHeatmap(filters)
      return response.data
    },
  })
}
