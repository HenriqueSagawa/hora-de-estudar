'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type { StudySessionFilters } from '@/types/api'
import { Search, X } from 'lucide-react'

interface SessionFiltersProps {
  filters: StudySessionFilters
  onFiltersChange: (filters: StudySessionFilters) => void
}

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todo período' },
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'year', label: 'Este ano' },
]

const SOURCE_OPTIONS = [
  { value: 'all', label: 'Todas as fontes' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'TIMER', label: 'Cronômetro' },
]

export function SessionFilters({ filters, onFiltersChange }: SessionFiltersProps) {
  const updateFilter = (key: keyof StudySessionFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
      page: 1, // Reset page when filtering
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      pageSize: filters.pageSize,
      orderBy: 'createdAt',
      orderDirection: 'desc',
    })
  }

  const hasActiveFilters = filters.period || filters.source || filters.subject

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filtrar por matéria..."
          value={filters.subject || ''}
          onChange={(e) => updateFilter('subject', e.target.value || undefined)}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.period || 'all'}
        onValueChange={(value) => updateFilter('period', value)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.source || 'all'}
        onValueChange={(value) => updateFilter('source', value)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Fonte" />
        </SelectTrigger>
        <SelectContent>
          {SOURCE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  )
}
