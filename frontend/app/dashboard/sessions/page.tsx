'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/ui/empty'
import { SessionFilters } from '@/components/sessions/session-filters'
import { SessionCard } from '@/components/sessions/session-card'
import { CreateSessionModal } from '@/components/sessions/create-session-modal'
import { useStudySessions } from '@/hooks/queries/use-study-sessions'
import type { StudySession, StudySessionFilters } from '@/types/api'
import { Plus, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'

function SessionsPageContent() {
  const searchParams = useSearchParams()
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('action') === 'create')
  const [editSession, setEditSession] = useState<StudySession | null>(null)
  const [filters, setFilters] = useState<StudySessionFilters>({
    page: 1,
    pageSize: 10,
    orderBy: 'createdAt',
    orderDirection: 'desc',
  })

  const { data, isLoading } = useStudySessions(filters)

  const handleEdit = (session: StudySession) => {
    setEditSession(session)
    setShowCreateModal(true)
  }

  const handleCloseModal = (open: boolean) => {
    setShowCreateModal(open)
    if (!open) {
      setEditSession(null)
    }
  }

  const sessions = data?.items || []
  const totalPages = data?.totalPages || 1
  const currentPage = data?.page || 1

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Sessões de Estudo"
        description="Gerencie seu histórico de sessões de estudo"
      >
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Sessão</span>
        </Button>
      </DashboardHeader>

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <SessionFilters filters={filters} onFiltersChange={setFilters} />

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <Empty
            icon={<BookOpen className="h-12 w-12" />}
            title="Nenhuma sessão encontrada"
            description={
              filters.period || filters.source || filters.subject
                ? 'Tente ajustar os filtros para encontrar sessões.'
                : 'Registre sua primeira sessão de estudo ou use o cronômetro.'
            }
            action={
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Sessão
              </Button>
            }
          />
        ) : (
          <>
            <div className="space-y-4">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} onEdit={handleEdit} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} ({data?.total || 0} sessões)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: currentPage - 1 })}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: currentPage + 1 })}
                    disabled={currentPage >= totalPages}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CreateSessionModal
        open={showCreateModal}
        onOpenChange={handleCloseModal}
        editSession={editSession}
      />
    </div>
  )
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<div className="p-6"><Skeleton className="h-96 w-full" /></div>}>
      <SessionsPageContent />
    </Suspense>
  )
}
