'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/ui/empty'
import { useStatisticsByDay } from '@/hooks/queries/use-statistics'
import { formatDuration } from '@/lib/format'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { format, parseISO, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart3 } from 'lucide-react'

export function WeeklyChart() {
  const { data: dailyStats, isLoading } = useStatisticsByDay({ period: 'week' })

  if (isLoading) {
    return <WeeklyChartSkeleton />
  }

  // Create last 7 days array
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i)
    return format(date, 'yyyy-MM-dd')
  })

  const chartData = last7Days.map((date) => {
    const stat = dailyStats?.find((s) => s.date === date)
    return {
      date,
      dayName: format(parseISO(date), 'EEE', { locale: ptBR }),
      hours: stat ? stat.totalSeconds / 3600 : 0,
      totalSeconds: stat?.totalSeconds || 0,
    }
  })

  const hasData = chartData.some((d) => d.totalSeconds > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Progresso Semanal</CardTitle>
        <CardDescription>Horas de estudo nos últimos 7 dias</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <Empty
            icon={<BarChart3 className="h-10 w-10" />}
            title="Sem dados esta semana"
            description="Registre sessões de estudo para ver seu progresso semanal."
          />
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="dayName"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}h`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="font-medium capitalize">{data.dayName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDuration(data.totalSeconds)}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="hours"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function WeeklyChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-1 h-4 w-56" />
      </CardHeader>
      <CardContent>
        <div className="flex h-[250px] items-end justify-around gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="w-8" style={{ height: `${Math.random() * 60 + 20}%` }} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
