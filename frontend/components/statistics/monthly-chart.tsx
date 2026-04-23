'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/ui/empty'
import { useStatisticsByMonth } from '@/hooks/queries/use-statistics'
import { formatDuration } from '@/lib/format'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { TrendingUp } from 'lucide-react'

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function MonthlyChart() {
  const { data: monthlyStats, isLoading } = useStatisticsByMonth({ period: 'year' })

  if (isLoading) {
    return <MonthlyChartSkeleton />
  }

  const chartData = monthlyStats?.map((stat) => ({
    month: MONTH_NAMES[parseInt(stat.month) - 1],
    hours: stat.totalSeconds / 3600,
    totalSeconds: stat.totalSeconds,
    sessions: stat.totalSessions,
  })) || []

  const hasData = chartData.some((d) => d.totalSeconds > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Evolução Mensal</CardTitle>
        <CardDescription>Horas de estudo por mês ao longo do ano</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <Empty
            icon={<TrendingUp className="h-10 w-10" />}
            title="Sem dados suficientes"
            description="Continue estudando para ver sua evolução mensal."
          />
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="month"
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
                          <p className="font-medium">{data.month}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDuration(data.totalSeconds)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {data.sessions} sessões
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MonthlyChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-1 h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  )
}
