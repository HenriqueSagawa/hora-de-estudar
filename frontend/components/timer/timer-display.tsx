'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TimerDisplayProps {
  startedAt?: string
  pausedAt?: string
  accumulatedSeconds?: number
  isRunning: boolean
  isPaused: boolean
  className?: string
}

export function TimerDisplay({
  startedAt,
  pausedAt,
  accumulatedSeconds = 0,
  isRunning,
  isPaused,
  className,
}: TimerDisplayProps) {
  const [displayTime, setDisplayTime] = useState(0)

  useEffect(() => {
    if (!startedAt) {
      setDisplayTime(0)
      return
    }

    const calculateElapsed = () => {
      const start = new Date(startedAt).getTime()
      
      if (isPaused && pausedAt) {
        // If paused, show time up to when it was paused
        const paused = new Date(pausedAt).getTime()
        return Math.floor((paused - start) / 1000) + accumulatedSeconds
      }
      
      if (isRunning) {
        // If running, calculate current elapsed time
        const now = Date.now()
        return Math.floor((now - start) / 1000) + accumulatedSeconds
      }
      
      return accumulatedSeconds
    }

    setDisplayTime(calculateElapsed())

    if (isRunning && !isPaused) {
      const interval = setInterval(() => {
        setDisplayTime(calculateElapsed())
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [startedAt, pausedAt, accumulatedSeconds, isRunning, isPaused])

  const hours = Math.floor(displayTime / 3600)
  const minutes = Math.floor((displayTime % 3600) / 60)
  const seconds = displayTime % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div className={cn('text-center', className)}>
      <div
        className={cn(
          'font-mono text-7xl font-bold tracking-tight transition-colors sm:text-8xl lg:text-9xl',
          isRunning && !isPaused ? 'text-primary' : '',
          isPaused ? 'text-muted-foreground animate-pulse' : ''
        )}
      >
        {hours > 0 && (
          <>
            <span>{pad(hours)}</span>
            <span className="mx-2 text-muted-foreground/50">:</span>
          </>
        )}
        <span>{pad(minutes)}</span>
        <span className="mx-2 text-muted-foreground/50">:</span>
        <span>{pad(seconds)}</span>
      </div>
    </div>
  )
}
