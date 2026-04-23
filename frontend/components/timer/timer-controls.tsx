'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Play, Pause, Square, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimerControlsProps {
  isRunning: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onFinish: () => void
  onCancel: () => void
  isStarting?: boolean
  isPausing?: boolean
  isResuming?: boolean
  isFinishing?: boolean
  isCancelling?: boolean
}

export function TimerControls({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onFinish,
  onCancel,
  isStarting,
  isPausing,
  isResuming,
  isFinishing,
  isCancelling,
}: TimerControlsProps) {
  const isProcessing = isStarting || isPausing || isResuming || isFinishing || isCancelling

  if (!isRunning) {
    return (
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={onStart}
          disabled={isStarting}
          className={cn(
            'h-20 w-20 rounded-full text-lg shadow-lg transition-all hover:scale-105',
            'bg-primary hover:bg-primary/90'
          )}
        >
          {isStarting ? <Spinner className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Cancel */}
      <Button
        size="lg"
        variant="outline"
        onClick={onCancel}
        disabled={isProcessing}
        className="h-16 w-16 rounded-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {isCancelling ? <Spinner className="h-6 w-6" /> : <X className="h-6 w-6" />}
      </Button>

      {/* Pause/Resume */}
      {isPaused ? (
        <Button
          size="lg"
          onClick={onResume}
          disabled={isProcessing}
          className="h-20 w-20 rounded-full text-lg shadow-lg transition-all hover:scale-105 bg-primary hover:bg-primary/90"
        >
          {isResuming ? <Spinner className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
        </Button>
      ) : (
        <Button
          size="lg"
          variant="secondary"
          onClick={onPause}
          disabled={isProcessing}
          className="h-20 w-20 rounded-full text-lg shadow-lg transition-all hover:scale-105"
        >
          {isPausing ? <Spinner className="h-8 w-8" /> : <Pause className="h-8 w-8" />}
        </Button>
      )}

      {/* Finish */}
      <Button
        size="lg"
        onClick={onFinish}
        disabled={isProcessing}
        className="h-16 w-16 rounded-full bg-success text-success-foreground hover:bg-success/90"
      >
        {isFinishing ? <Spinner className="h-6 w-6" /> : <Square className="h-6 w-6" />}
      </Button>
    </div>
  )
}
