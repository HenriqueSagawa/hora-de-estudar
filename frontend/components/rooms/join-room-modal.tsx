'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useJoinRoom } from '@/hooks/queries/use-rooms'

interface JoinRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinRoomModal({ open, onOpenChange }: JoinRoomModalProps) {
  const router = useRouter()
  const [inviteCode, setInviteCode] = useState('')
  const joinRoom = useJoinRoom()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inviteCode.trim()) {
      toast.error('Digite o código de convite')
      return
    }

    try {
      const response = await joinRoom.mutateAsync(inviteCode.trim())
      toast.success('Você entrou na sala!')
      setInviteCode('')
      onOpenChange(false)
      router.push(`/dashboard/rooms/${response.data.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Código de convite inválido')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Entrar em uma Sala</DialogTitle>
          <DialogDescription>
            Digite o código de convite para entrar em uma sala existente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="inviteCode">Código de convite</FieldLabel>
              <Input
                id="inviteCode"
                placeholder="Ex: ABC123XY"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="font-mono text-center text-lg tracking-widest"
              />
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={joinRoom.isPending}>
              {joinRoom.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Entrando...
                </>
              ) : (
                'Entrar na Sala'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
