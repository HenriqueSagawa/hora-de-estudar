'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useCreateManualSession, useUpdateSession } from '@/hooks/queries/use-study-sessions'
import { useRooms } from '@/hooks/queries/use-rooms'
import { STUDY_TYPE_LABELS, FOCUS_LEVEL_LABELS } from '@/lib/format'
import type { StudySession } from '@/types/api'

const NO_ROOM_VALUE = '__no_room__'

const sessionSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  subject: z.string().min(1, 'Matéria é obrigatória'),
  studyType: z.enum(['READING', 'EXERCISES', 'VIDEO', 'REVIEW', 'PROJECT', 'OTHER']),
  hours: z.coerce.number().min(0).max(23),
  minutes: z.coerce.number().min(0).max(59),
  studyDate: z.string().min(1, 'Data é obrigatória'),
  focusLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  roomId: z.string().optional(),
})

type SessionForm = z.infer<typeof sessionSchema>

interface CreateSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editSession?: StudySession | null
}

export function CreateSessionModal({ open, onOpenChange, editSession }: CreateSessionModalProps) {
  const createSession = useCreateManualSession()
  const updateSession = useUpdateSession()
  const { data: roomsData } = useRooms()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SessionForm>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      studyType: 'READING',
      hours: 1,
      minutes: 0,
      studyDate: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  useEffect(() => {
    if (editSession) {
      const hours = Math.floor(editSession.durationSeconds / 3600)
      const minutes = Math.floor((editSession.durationSeconds % 3600) / 60)
      reset({
        title: editSession.title,
        description: editSession.description || '',
        subject: editSession.subject,
        studyType: editSession.studyType,
        hours,
        minutes,
        studyDate: editSession.studyDate.split('T')[0],
        focusLevel: editSession.focusLevel,
        roomId: editSession.roomId || undefined,
      })
    } else {
      reset({
        title: '',
        description: '',
        subject: '',
        studyType: 'READING',
        hours: 1,
        minutes: 0,
        studyDate: format(new Date(), 'yyyy-MM-dd'),
        focusLevel: undefined,
        roomId: undefined,
      })
    }
  }, [editSession, reset])

  const onSubmit = async (data: SessionForm) => {
    const durationSeconds = data.hours * 3600 + data.minutes * 60

    if (durationSeconds === 0) {
      toast.error('A duração deve ser maior que zero')
      return
    }

    try {
      if (editSession) {
        await updateSession.mutateAsync({
          id: editSession.id,
          payload: {
            title: data.title,
            description: data.description,
            subject: data.subject,
            studyType: data.studyType,
            durationSeconds,
            studyDate: data.studyDate,
            focusLevel: data.focusLevel,
          },
        })
        toast.success('Sessão atualizada com sucesso!')
      } else {
        await createSession.mutateAsync({
          title: data.title,
          description: data.description,
          subject: data.subject,
          studyType: data.studyType,
          durationSeconds,
          studyDate: data.studyDate,
          focusLevel: data.focusLevel,
          roomId: data.roomId,
        })
        toast.success('Sessão criada com sucesso!')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar sessão')
    }
  }

  const isPending = createSession.isPending || updateSession.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editSession ? 'Editar Sessão' : 'Nova Sessão de Estudo'}</DialogTitle>
          <DialogDescription>
            {editSession
              ? 'Atualize os dados da sessão de estudo.'
              : 'Registre manualmente uma sessão de estudo concluída.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Título</FieldLabel>
              <Input
                id="title"
                placeholder="Ex: Revisão de Cálculo I"
                {...register('title')}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </Field>

            <Field>
              <FieldLabel htmlFor="subject">Matéria</FieldLabel>
              <Input
                id="subject"
                placeholder="Ex: Matemática"
                {...register('subject')}
                className={errors.subject ? 'border-destructive' : ''}
              />
              {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Descrição (opcional)</FieldLabel>
              <Textarea
                id="description"
                placeholder="O que você estudou..."
                rows={2}
                {...register('description')}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Tipo de Estudo</FieldLabel>
                <Select
                  value={watch('studyType')}
                  onValueChange={(value) => setValue('studyType', value as SessionForm['studyType'])}
                >
                  <SelectTrigger>
                    <SelectValue />
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

              <Field>
                <FieldLabel>Nível de Foco</FieldLabel>
                <Select
                  value={watch('focusLevel') || ''}
                  onValueChange={(value) =>
                    setValue('focusLevel', value as SessionForm['focusLevel'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FOCUS_LEVEL_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field>
                <FieldLabel htmlFor="hours">Horas</FieldLabel>
                <Input
                  id="hours"
                  type="number"
                  min={0}
                  max={23}
                  {...register('hours')}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="minutes">Minutos</FieldLabel>
                <Input
                  id="minutes"
                  type="number"
                  min={0}
                  max={59}
                  {...register('minutes')}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="studyDate">Data</FieldLabel>
                <Input
                  id="studyDate"
                  type="date"
                  {...register('studyDate')}
                  className={errors.studyDate ? 'border-destructive' : ''}
                />
              </Field>
            </div>

            {!editSession && roomsData && roomsData.items.length > 0 && (
              <Field>
                <FieldLabel>Vincular a uma sala (opcional)</FieldLabel>
                <Select
                  value={watch('roomId') || ''}
                  onValueChange={(value) =>
                    setValue('roomId', value === NO_ROOM_VALUE ? undefined : value)
                  }
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

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Salvando...
                </>
              ) : editSession ? (
                'Salvar Alterações'
              ) : (
                'Criar Sessão'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
