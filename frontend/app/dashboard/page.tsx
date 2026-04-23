'use client'

import { DashboardHeader } from '@/components/dashboard/header'
import { StatsCard, StatsCardSkeleton } from '@/components/dashboard/stats-card'
import { RecentSessions } from '@/components/dashboard/recent-sessions'
import { SubjectChart } from '@/components/dashboard/subject-chart'
import { WeeklyChart } from '@/components/dashboard/weekly-chart'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { useStatisticsOverview } from '@/hooks/queries/use-statistics'
import { formatDuration, formatHours } from '@/lib/format'
import { Clock, Calendar, Flame, Target } from 'lucide-react'

export default function DashboardPage() {
  const { data: stats, isLoading } = useStatisticsOverview()

  return (
    <div className="flex flex-col">
      <DashboardHeader />

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Stats Cards */}
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
                title="Esta Semana"
                value={formatDuration(stats?.weekSeconds || 0)}
                description="Tempo estudado nos últimos 7 dias"
                icon={Calendar}
              />
              <StatsCard
                title="Sequência"
                value={`${stats?.streak || 0} dias`}
                description="Continue estudando!"
                icon={Flame}
              />
              <StatsCard
                title="Média por Sessão"
                value={formatDuration(stats?.averagePerSession || 0)}
                description={stats?.topSubject ? `Top: ${stats.topSubject}` : 'Registre mais sessões'}
                icon={Target}
              />
            </>
          )}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <WeeklyChart />
            <RecentSessions />
          </div>

          <div className="space-y-6">
            <QuickActions />
            <SubjectChart />
          </div>
        </div>
      </div>
    </div>
  )
}
