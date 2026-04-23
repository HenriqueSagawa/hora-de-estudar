import { http } from '@/lib/http'
import type {
  ApiResponse,
  HeatmapData,
  StatisticsByDay,
  StatisticsByMonth,
  StatisticsBySubject,
  StatisticsByWeek,
  StatisticsFilters,
  StatisticsOverview,
} from '@/types/api'

export const statisticsService = {
  async getOverview(filters?: StatisticsFilters): Promise<ApiResponse<StatisticsOverview>> {
    return http.get('/statistics/me/overview', filters as Record<string, string | number | boolean | undefined>)
  },

  async getBySubject(filters?: StatisticsFilters): Promise<ApiResponse<StatisticsBySubject[]>> {
    return http.get('/statistics/me/by-subject', filters as Record<string, string | number | boolean | undefined>)
  },

  async getByDay(filters?: StatisticsFilters): Promise<ApiResponse<StatisticsByDay[]>> {
    return http.get('/statistics/me/by-day', filters as Record<string, string | number | boolean | undefined>)
  },

  async getByWeek(filters?: StatisticsFilters): Promise<ApiResponse<StatisticsByWeek[]>> {
    return http.get('/statistics/me/by-week', filters as Record<string, string | number | boolean | undefined>)
  },

  async getByMonth(filters?: StatisticsFilters): Promise<ApiResponse<StatisticsByMonth[]>> {
    return http.get('/statistics/me/by-month', filters as Record<string, string | number | boolean | undefined>)
  },

  async getHeatmap(filters?: StatisticsFilters): Promise<ApiResponse<HeatmapData[]>> {
    return http.get('/statistics/me/heatmap', filters as Record<string, string | number | boolean | undefined>)
  },
}
