'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDeleteSession } from '@/hooks/queries/use-study-sessions'
import {
  formatDuration,
  formatDateShort,
  STUDY_TYPE_LABELS,
  FOCUS_LEVEL_LABELS,
  SESSION_SOURCE_LABELS,
} from '@/lib/format'
import type { StudySession } from '@/types/api'
import { Clock, Timer, MoreVertical, Pencil, Trash2, BookOpen, Target, Users } from 'lucide-react'

interface SessionCardProps {
  session: StudySession
  onEdit?: (session: StudySession) => void
}

export function SessionCard({ session, onEdit }: SessionCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteSession = useDeleteSession()

  const handleDelete = async () => {
    try {
      await deleteSession.mutateAsync(session.id)
      toast.success('Sessão excluída com sucesso!')
      setShowDeleteDialog(false)
    } catch {
      toast.error('Erro ao excluir sessão')
    }
  }

  return (
    <>
      <Card className="group transition-all hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                {session.source === 'TIMER' ? (
                  <Timer className="h-5 w-5 text-primary" />
                ) : (
                  <Clock className="h-5 w-5 text-primary" />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-foreground leading-tight">{session.title}</h3>
                {session.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{session.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Badge variant="secondary" className="gap-1">
                    <BookOpen className="h-3 w-3" />
                    {session.subject}
                  </Badge>
                  <Badge variant="outline">{STUDY_TYPE_LABELS[session.studyType]}</Badge>
                  {session.focusLevel && (
                    <Badge variant="outline" className="gap-1">
                      <Target className="h-3 w-3" />
                      {FOCUS_LEVEL_LABELS[session.focusLevel]}
                    </Badge>
                  )}
                  {session.room && (
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />
                      {session.room.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-right">
                <p className="text-xl font-bold text-foreground">{formatDuration(session.durationSeconds)}</p>
                <p className="text-xs text-muted-foreground">{formatDateShort(session.studyDate)}</p>
                <Badge
                  variant={session.source === 'TIMER' ? 'default' : 'secondary'}
                  className="mt-2"
                >
                  {SESSION_SOURCE_LABELS[session.source]}
                </Badge>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(session)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir sessão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A sessão será removida permanentemente do seu histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
