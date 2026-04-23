'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/ui/empty'
import { RoomCard } from '@/components/rooms/room-card'
import { CreateRoomModal } from '@/components/rooms/create-room-modal'
import { JoinRoomModal } from '@/components/rooms/join-room-modal'
import { useRooms } from '@/hooks/queries/use-rooms'
import { Plus, UserPlus, Users } from 'lucide-react'

export default function RoomsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const { data, isLoading } = useRooms()

  const rooms = data?.items || []

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Salas"
        description="Gerencie suas salas de estudo e compita com amigos"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowJoinModal(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Entrar</span>
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Criar Sala</span>
          </Button>
        </div>
      </DashboardHeader>

      <div className="flex-1 p-4 lg:p-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <Empty
            icon={<Users className="h-12 w-12" />}
            title="Nenhuma sala encontrada"
            description="Crie uma sala para estudar em grupo ou entre em uma sala existente usando um código de convite."
            action={
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowJoinModal(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Entrar com Código
                </Button>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Sala
                </Button>
              </div>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>

      <CreateRoomModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      <JoinRoomModal open={showJoinModal} onOpenChange={setShowJoinModal} />
    </div>
  )
}
