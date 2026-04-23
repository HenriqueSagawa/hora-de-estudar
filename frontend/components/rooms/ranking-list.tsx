'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/ui/empty'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRoomRanking } from '@/hooks/queries/use-rooms'
import { formatDuration } from '@/lib/format'
import type { RoomRankingFilters, RoomRankingItem } from '@/types/api'
import { Trophy, Medal, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'year', label: 'Este ano' },
  { value: 'all', label: 'Todo período' },
]

interface RankingListProps {
  roomId: string
}

function getRankingUser(item: RoomRankingItem) {
  const name = item.user?.name?.trim() || item.name?.trim() || 'Participante'
  const username = item.user?.username?.trim() || item.username?.trim()
  const avatarUrl = item.user?.avatarUrl || item.avatarUrl

  return { name, username, avatarUrl }
}

function getAvatarFallback(name: string) {
  return name.charAt(0).toUpperCase() || 'P'
}

export function RankingList({ roomId }: RankingListProps) {
  const [period, setPeriod] = useState<RoomRankingFilters['period']>('month')
  const { data: ranking, isLoading } = useRoomRanking(roomId, { period })
  const rankingItems =
    ranking?.map((item) => ({
      ...item,
      displayUser: getRankingUser(item),
    })) || []

  if (isLoading) {
    return <RankingListSkeleton />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Ranking da Sala</CardTitle>
          <CardDescription>Competição de horas de estudo</CardDescription>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as RoomRankingFilters['period'])}>
          <SelectTrigger className="w-[140px]">
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
      </CardHeader>
      <CardContent>
        {rankingItems.length === 0 ? (
          <Empty
            icon={<Trophy className="h-10 w-10" />}
            title="Sem ranking ainda"
            description="Registre sessões de estudo vinculadas a esta sala para aparecer no ranking."
          />
        ) : (
          <div className="space-y-3">
            {/* Top 3 Podium */}
            {rankingItems.length >= 3 && (
              <div className="flex items-end justify-center gap-3 pb-6 mb-6 border-b">
                {/* 2nd place */}
                <div className="flex flex-col items-center">
                  <Avatar className="h-14 w-14 ring-2 ring-muted">
                    <AvatarImage
                      src={rankingItems[1].displayUser.avatarUrl}
                      alt={rankingItems[1].displayUser.name}
                    />
                    <AvatarFallback>
                      {getAvatarFallback(rankingItems[1].displayUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Medal className="h-5 w-5 text-gray-400 mt-2" />
                  <p className="text-sm font-medium mt-1">
                    {rankingItems[1].displayUser.name.split(' ')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(rankingItems[1].totalSeconds)}
                  </p>
                </div>

                {/* 1st place */}
                <div className="flex flex-col items-center -mt-4">
                  <Avatar className="h-20 w-20 ring-4 ring-yellow-400">
                    <AvatarImage
                      src={rankingItems[0].displayUser.avatarUrl}
                      alt={rankingItems[0].displayUser.name}
                    />
                    <AvatarFallback className="text-xl">
                      {getAvatarFallback(rankingItems[0].displayUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Trophy className="h-6 w-6 text-yellow-500 mt-2" />
                  <p className="text-sm font-semibold mt-1">
                    {rankingItems[0].displayUser.name.split(' ')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(rankingItems[0].totalSeconds)}
                  </p>
                </div>

                {/* 3rd place */}
                <div className="flex flex-col items-center">
                  <Avatar className="h-14 w-14 ring-2 ring-amber-700">
                    <AvatarImage
                      src={rankingItems[2].displayUser.avatarUrl}
                      alt={rankingItems[2].displayUser.name}
                    />
                    <AvatarFallback>
                      {getAvatarFallback(rankingItems[2].displayUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Award className="h-5 w-5 text-amber-700 mt-2" />
                  <p className="text-sm font-medium mt-1">
                    {rankingItems[2].displayUser.name.split(' ')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(rankingItems[2].totalSeconds)}
                  </p>
                </div>
              </div>
            )}

            {/* Full list */}
            <div className="space-y-2">
              {rankingItems.map((item) => (
                <div
                  key={item.userId}
                  className={cn(
                    'flex items-center gap-4 rounded-lg p-3 transition-colors',
                    item.position <= 3 ? 'bg-accent/50' : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center">
                    {item.position === 1 && <Trophy className="h-5 w-5 text-yellow-500" />}
                    {item.position === 2 && <Medal className="h-5 w-5 text-gray-400" />}
                    {item.position === 3 && <Award className="h-5 w-5 text-amber-700" />}
                    {item.position > 3 && (
                      <span className="text-sm font-medium text-muted-foreground">{item.position}</span>
                    )}
                  </div>

                  <Avatar className="h-9 w-9">
                    <AvatarImage src={item.displayUser.avatarUrl} alt={item.displayUser.name} />
                    <AvatarFallback>{getAvatarFallback(item.displayUser.name)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.displayUser.name}</p>
                    {item.displayUser.username && (
                      <p className="text-xs text-muted-foreground">@{item.displayUser.username}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">{formatDuration(item.totalSeconds)}</p>
                    <p className="text-xs text-muted-foreground">{item.totalSessions} sessões</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RankingListSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-1 h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-[140px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg p-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-1 h-3 w-20" />
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="mt-1 h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
