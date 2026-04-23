'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/ui/empty'
import { useStudySessions } from '@/hooks/queries/use-study-sessions'
import { formatDuration, formatRelativeTime, STUDY_TYPE_LABELS, SESSION_SOURCE_LABELS } from '@/lib/format'
import { Clock, ArrowRight, Timer, BookOpen } from 'lucide-react'

export function RecentSessions() {
  const { data, isLoading } = useStudySessions({ pageSize: 5, orderBy: 'createdAt', orderDirection: 'desc' })

  if (isLoading) {
    return <RecentSessionsSkeleton />
  }

  const sessions = data?.items || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Sessões Recentes</CardTitle>
          <CardDescription>Suas últimas sessões de estudo</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/sessions" className="flex items-center gap-1">
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <Empty 
            icon={<BookOpen className="h-10 w-10" />}
            title="Nenhuma sessão registrada"
            description="Comece a estudar e registre sua primeira sessão."
          />
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    {session.source === 'TIMER' ? (
                      <Timer className="h-5 w-5 text-primary" />
                    ) : (
                      <Clock className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{session.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{session.subject}</span>
                      <span>·</span>
                      <span>{STUDY_TYPE_LABELS[session.studyType]}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatDuration(session.durationSeconds)}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(session.createdAt)}</p>
                  </div>
                  <Badge variant={session.source === 'TIMER' ? 'default' : 'secondary'}>
                    {SESSION_SOURCE_LABELS[session.source]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RecentSessionsSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-1 h-4 w-52" />
        </div>
        <Skeleton className="h-8 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="mt-1 h-4 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="mt-1 h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
