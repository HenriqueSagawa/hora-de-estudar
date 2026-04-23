'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
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
import { useCreateRoom } from '@/hooks/queries/use-rooms'
import { ROOM_VISIBILITY_LABELS } from '@/lib/format'
import type { RoomVisibility } from '@/types/api'

const roomSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  coverImageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
})

type RoomForm = z.infer<typeof roomSchema>

interface CreateRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRoomModal({ open, onOpenChange }: CreateRoomModalProps) {
  const createRoom = useCreateRoom()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoomForm>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      visibility: 'PRIVATE',
    },
  })

  const onSubmit = async (data: RoomForm) => {
    try {
      await createRoom.mutateAsync({
        name: data.name,
        description: data.description,
        coverImageUrl: data.coverImageUrl || undefined,
        visibility: data.visibility as RoomVisibility,
      })
      toast.success('Sala criada com sucesso!')
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar sala')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Nova Sala</DialogTitle>
          <DialogDescription>
            Crie uma sala para estudar em grupo e competir com amigos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nome da sala</FieldLabel>
              <Input
                id="name"
                placeholder="Ex: Grupo de Estudos de Cálculo"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Descrição (opcional)</FieldLabel>
              <Textarea
                id="description"
                placeholder="Descreva o objetivo da sala..."
                rows={3}
                {...register('description')}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="coverImageUrl">URL da imagem de capa (opcional)</FieldLabel>
              <Input
                id="coverImageUrl"
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                {...register('coverImageUrl')}
                className={errors.coverImageUrl ? 'border-destructive' : ''}
              />
              {errors.coverImageUrl && (
                <p className="text-sm text-destructive">{errors.coverImageUrl.message}</p>
              )}
            </Field>

            <Field>
              <FieldLabel>Visibilidade</FieldLabel>
              <Select
                value={watch('visibility')}
                onValueChange={(value) => setValue('visibility', value as RoomVisibility)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROOM_VISIBILITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Salas privadas só podem ser acessadas por código de convite.
              </p>
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createRoom.isPending}>
              {createRoom.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Criando...
                </>
              ) : (
                'Criar Sala'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
