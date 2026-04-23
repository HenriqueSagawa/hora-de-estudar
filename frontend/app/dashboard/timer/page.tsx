'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TimerDisplay } from '@/components/timer/timer-display'
import { TimerControls } from '@/components/timer/timer-controls'
import { TimerSetup } from '@/components/timer/timer-setup'
import {
  useActiveTimer,
  useStartTimer,
  usePauseTimer,
  useResumeTimer,
  useFinishTimer,
  useCancelTimer,
} from '@/hooks/queries/use-study-sessions'
import type { StartTimerPayload } from '@/types/api'
import { Timer, Pause } from 'lucide-react'

export default function TimerPage() {
  const [settings, setSettings] = useState<StartTimerPayload>({})

  const { data: activeTimer } = useActiveTimer()
  const startTimer = useStartTimer()
  const pauseTimer = usePauseTimer()
  const resumeTimer = useResumeTimer()
  const finishTimer = useFinishTimer()
  const cancelTimer = useCancelTimer()

  const isRunning = !!activeTimer && activeTimer.timerStatus !== 'FINISHED' && activeTimer.timerStatus !== 'CANCELLED'
  const isPaused = activeTimer?.timerStatus === 'PAUSED'

  const handleStart = async () => {
    try {
      await startTimer.mutateAsync(settings)
      toast.success('Cronômetro iniciado!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao iniciar cronômetro')
    }
  }

  const handlePause = async () => {
    if (!activeTimer) return
    try {
      await pauseTimer.mutateAsync(activeTimer.id)
      toast.info('Cronômetro pausado')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao pausar cronômetro')
    }
  }

  const handleResume = async () => {
    if (!activeTimer) return
    try {
      await resumeTimer.mutateAsync(activeTimer.id)
      toast.success('Cronômetro retomado!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao retomar cronômetro')
    }
  }

  const handleFinish = async () => {
    if (!activeTimer) return
    try {
      await finishTimer.mutateAsync(activeTimer.id)
      toast.success('Sessão finalizada com sucesso!')
      setSettings({})
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao finalizar sessão')
    }
  }

  const handleCancel = async () => {
    if (!activeTimer) return
    try {
      await cancelTimer.mutateAsync(activeTimer.id)
      toast.info('Sessão cancelada')
      setSettings({})
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao cancelar sessão')
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="Cronômetro"
        description="Registre seu tempo de estudo em tempo real"
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6">
        <Card className="w-full max-w-2xl border-2 shadow-xl">
          <CardContent className="p-8 lg:p-12">
            {/* Status Badge */}
            <div className="flex justify-center mb-8">
              {isRunning ? (
                <Badge
                  variant={isPaused ? 'secondary' : 'default'}
                  className="gap-2 px-4 py-2 text-sm"
                >
                  {isPaused ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pausado
                    </>
                  ) : (
                    <>
                      <Timer className="h-4 w-4 animate-pulse" />
                      Em andamento
                    </>
                  )}
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-2 px-4 py-2 text-sm">
                  <Timer className="h-4 w-4" />
                  Pronto para começar
                </Badge>
              )}
            </div>

            {/* Timer Display */}
            <TimerDisplay
              startedAt={activeTimer?.startedAt}
              pausedAt={activeTimer?.pausedAt}
              accumulatedSeconds={activeTimer?.durationSeconds || 0}
              isRunning={isRunning}
              isPaused={isPaused}
              className="mb-8"
            />

            {/* Session Info (when running) */}
            {isRunning && activeTimer && (
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {activeTimer.title && (
                  <Badge variant="secondary">{activeTimer.title}</Badge>
                )}
                {activeTimer.subject && (
                  <Badge variant="outline">{activeTimer.subject}</Badge>
                )}
                {activeTimer.room && (
                  <Badge variant="outline">{activeTimer.room.name}</Badge>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="mb-8">
              <TimerControls
                isRunning={isRunning}
                isPaused={isPaused}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onFinish={handleFinish}
                onCancel={handleCancel}
                isStarting={startTimer.isPending}
                isPausing={pauseTimer.isPending}
                isResuming={resumeTimer.isPending}
                isFinishing={finishTimer.isPending}
                isCancelling={cancelTimer.isPending}
              />
            </div>

            {/* Setup Form (only when not running) */}
            {!isRunning && (
              <div className="border-t pt-8">
                <h3 className="text-center text-sm font-medium text-muted-foreground mb-6">
                  Configure sua sessão antes de começar
                </h3>
                <TimerSetup
                  settings={settings}
                  onSettingsChange={setSettings}
                  disabled={isRunning}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="mt-8 text-center text-sm text-muted-foreground max-w-md">
          <p>
            {isRunning
              ? isPaused
                ? 'Clique em play para retomar ou no quadrado para finalizar a sessão.'
                : 'Mantenha o foco! Você pode pausar a qualquer momento.'
              : 'Preencha os campos acima e clique no botão play para iniciar o cronômetro.'}
          </p>
        </div>
      </div>
    </div>
  )
}
