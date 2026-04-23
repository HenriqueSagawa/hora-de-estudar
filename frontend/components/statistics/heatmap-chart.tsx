'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/ui/empty'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useHeatmap } from '@/hooks/queries/use-statistics'
import { formatDateShort, formatDuration } from '@/lib/format'
import { subDays, format, startOfWeek, addDays, parseISO, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

const LEVEL_COLORS = [
  'bg-muted',
  'bg-chart-1/20',
  'bg-chart-1/40',
  'bg-chart-1/60',
  'bg-chart-1/80',
  'bg-chart-1',
]

export function HeatmapChart() {
  const { data: heatmapData, isLoading } = useHeatmap({ period: 'year' })

  if (isLoading) {
    return <HeatmapSkeleton />
  }

  // Generate last 52 weeks of dates
  const today = new Date()
  const startDate = startOfWeek(subDays(today, 364), { weekStartsOn: 0 })
  
  const weeks: Date[][] = []
  let currentDate = startDate
  
  for (let week = 0; week < 53; week++) {
    const weekDays: Date[] = []
    for (let day = 0; day < 7; day++) {
      weekDays.push(currentDate)
      currentDate = addDays(currentDate, 1)
    }
    weeks.push(weekDays)
  }

  const getLevel = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const data = heatmapData?.find((d) => d.date === dateStr)
    return data?.level || 0
  }

  const getCount = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const data = heatmapData?.find((d) => d.date === dateStr)
    return data?.count || 0
  }

  const hasData = heatmapData && heatmapData.some((d) => d.count > 0)

  const dayLabels = ['Dom', '', 'Ter', '', 'Qui', '', 'Sáb']

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Calendário de Atividades</CardTitle>
        <CardDescription>Sua consistência de estudos ao longo do ano</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <Empty
            icon={<CalendarDays className="h-10 w-10" />}
            title="Sem atividades registradas"
            description="Comece a estudar para ver seu calendário de atividades."
          />
        ) : (
          <TooltipProvider>
            <div className="overflow-x-auto">
              <div className="inline-flex gap-1">
                {/* Day labels */}
                <div className="flex flex-col gap-1 pr-2">
                  {dayLabels.map((label, i) => (
                    <div key={i} className="h-3 w-8 text-xs text-muted-foreground flex items-center">
                      {label}
                    </div>
                  ))}
                </div>
                
                {/* Weeks */}
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => {
                      const level = getLevel(day)
                      const count = getCount(day)
                      const isToday = isSameDay(day, today)
                      const isFuture = day > today
                      
                      return (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                'h-3 w-3 rounded-sm transition-colors',
                                isFuture ? 'bg-transparent' : LEVEL_COLORS[level],
                                isToday && 'ring-1 ring-primary ring-offset-1'
                              )}
                            />
                          </TooltipTrigger>
                          {!isFuture && (
                            <TooltipContent>
                              <p className="font-medium">{formatDateShort(day)}</p>
                              <p className="text-xs text-muted-foreground">
                                {count > 0 ? formatDuration(count) : 'Sem atividade'}
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      )
                    })}
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                <span>Menos</span>
                {LEVEL_COLORS.map((color, i) => (
                  <div key={i} className={cn('h-3 w-3 rounded-sm', color)} />
                ))}
                <span>Mais</span>
              </div>
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  )
}

function HeatmapSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-1 h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-28 w-full" />
      </CardContent>
    </Card>
  )
}
