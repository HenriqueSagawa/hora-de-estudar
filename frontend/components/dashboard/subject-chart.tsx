'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/ui/empty'
import { useStatisticsBySubject } from '@/hooks/queries/use-statistics'
import { formatDuration, formatPercentage } from '@/lib/format'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { BookOpen } from 'lucide-react'

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function SubjectChart() {
  const { data: subjects, isLoading } = useStatisticsBySubject({ period: 'month' })

  if (isLoading) {
    return <SubjectChartSkeleton />
  }

  const chartData = subjects?.slice(0, 5).map((item) => ({
    name: item.subject,
    value: item.totalSeconds,
    percentage: item.percentage,
  })) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribuição por Matéria</CardTitle>
        <CardDescription>Tempo dedicado a cada matéria este mês</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <Empty
            icon={<BookOpen className="h-10 w-10" />}
            title="Sem dados ainda"
            description="Registre sessões de estudo para ver a distribuição por matéria."
          />
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDuration(data.value)} ({formatPercentage(data.percentage)})
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SubjectChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-1 h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="flex h-[250px] items-center justify-center">
          <Skeleton className="h-40 w-40 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}
