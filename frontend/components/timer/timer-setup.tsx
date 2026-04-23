'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { useRooms } from '@/hooks/queries/use-rooms'
import { STUDY_TYPE_LABELS } from '@/lib/format'
import type { StartTimerPayload, StudyType } from '@/types/api'

const NO_ROOM_VALUE = '__no_room__'

interface TimerSetupProps {
  settings: StartTimerPayload
  onSettingsChange: (settings: StartTimerPayload) => void
  disabled?: boolean
}

export function TimerSetup({ settings, onSettingsChange, disabled }: TimerSetupProps) {
  const { data: roomsData } = useRooms()

  const updateSetting = <K extends keyof StartTimerPayload>(key: K, value: StartTimerPayload[K]) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Título da sessão (opcional)</FieldLabel>
          <Input
            id="title"
            placeholder="Ex: Estudando para prova"
            value={settings.title || ''}
            onChange={(e) => updateSetting('title', e.target.value || undefined)}
            disabled={disabled}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="subject">Matéria</FieldLabel>
            <Input
              id="subject"
              placeholder="Ex: Matemática"
              value={settings.subject || ''}
              onChange={(e) => updateSetting('subject', e.target.value || undefined)}
              disabled={disabled}
            />
          </Field>

          <Field>
            <FieldLabel>Tipo de Estudo</FieldLabel>
            <Select
              value={settings.studyType || ''}
              onValueChange={(value) => updateSetting('studyType', value as StudyType)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STUDY_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {roomsData && roomsData.items.length > 0 && (
          <Field>
            <FieldLabel>Vincular a uma sala</FieldLabel>
            <Select
              value={settings.roomId || ''}
              onValueChange={(value) =>
                updateSetting('roomId', value === NO_ROOM_VALUE ? undefined : value)
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma sala..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_ROOM_VALUE}>Nenhuma sala</SelectItem>
                {roomsData.items.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </FieldGroup>
    </div>
  )
}
