'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { StatsCard, StatsCardSkeleton } from '@/components/dashboard/stats-card'
import { SubjectChart } from '@/components/dashboard/subject-chart'
import { WeeklyChart } from '@/components/dashboard/weekly-chart'
import { HeatmapChart } from '@/components/statistics/heatmap-chart'
import { MonthlyChart } from '@/components/statistics/monthly-chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStatisticsOverview } from '@/hooks/queries/use-statistics'
import { formatDuration, formatHours } from '@/lib/format'
import { Clock, Target, Flame, TrendingUp } from 'lucide-react'
import type { StatisticsFilters } from '@/types/api'

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'year', label: 'Este ano' },
  { value: 'all', label: 'Todo período' },
]

export default function StatisticsPage() {
  const [period, setPeriod] = useState<StatisticsFilters['period']>('month')
  const { data: stats, isLoading } = useStatisticsOverview({ period })

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Estatísticas"
        description="Acompanhe seu progresso e desempenho nos estudos"
      >
        <Select value={period} onValueChange={(v) => setPeriod(v as StatisticsFilters['period'])}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DashboardHeader>

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Overview Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Total de Horas"
                value={formatHours(stats?.totalSeconds || 0)}
                description={`${stats?.totalSessions || 0} sessões registradas`}
                icon={Clock}
              />
              <StatsCard
                title="Média por Sessão"
                value={formatDuration(stats?.averagePerSession || 0)}
                description="Tempo médio de cada sessão"
                icon={Target}
              />
              <StatsCard
                title="Sequência Atual"
                value={`${stats?.streak || 0} dias`}
                description="Continue estudando!"
                icon={Flame}
              />
              <StatsCard
                title="Matéria Principal"
                value={stats?.topSubject || '-'}
                description="Onde você mais estudou"
                icon={TrendingUp}
              />
            </>
          )}
        </div>

        {/* Heatmap */}
        <HeatmapChart />

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <WeeklyChart />
          <SubjectChart />
        </div>

        {/* Monthly Evolution */}
        <MonthlyChart />
      </div>
    </div>
  )
}
