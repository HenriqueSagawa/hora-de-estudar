'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RankingList } from '@/components/rooms/ranking-list'
import { useRoom, useRoomMembers, useLeaveRoom } from '@/hooks/queries/use-rooms'
import { ROOM_VISIBILITY_LABELS, ROOM_ROLE_LABELS, formatRelativeTime, formatDuration } from '@/lib/format'
import {
  Users,
  Lock,
  Globe,
  Crown,
  Copy,
  MoreVertical,
  LogOut,
  Settings,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('ranking')
  
  const { data: room, isLoading: roomLoading } = useRoom(roomId)
  const { data: members, isLoading: membersLoading } = useRoomMembers(roomId)
  const leaveRoom = useLeaveRoom()

  const handleCopyInviteCode = () => {
    if (room?.inviteCode) {
      navigator.clipboard.writeText(room.inviteCode)
      toast.success('Código de convite copiado!')
    }
  }

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom.mutateAsync(roomId)
      toast.success('Você saiu da sala')
      router.push('/dashboard/rooms')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao sair da sala')
    }
  }

  if (roomLoading) {
    return (
      <div className="flex flex-col">
        <DashboardHeader />
        <div className="p-4 lg:p-6 space-y-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex flex-col">
        <DashboardHeader title="Sala não encontrada" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Esta sala não existe ou você não tem acesso.</p>
            <Button asChild>
              <Link href="/dashboard/rooms">Voltar para Salas</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = room.myRole === 'OWNER'
  const isAdmin = room.myRole === 'ADMIN'

  return (
    <div className="flex flex-col">
      <DashboardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/rooms">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Room Header Card */}
        <Card>
          {room.coverImageUrl && (
            <div className="h-32 overflow-hidden rounded-t-lg">
              <img
                src={room.coverImageUrl}
                alt={room.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{room.name}</h1>
                  <Badge variant="outline" className="gap-1">
                    {room.visibility === 'PRIVATE' ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      <Globe className="h-3 w-3" />
                    )}
                    {ROOM_VISIBILITY_LABELS[room.visibility]}
                  </Badge>
                  {room.myRole && (
                    <Badge variant="secondary" className="gap-1">
                      {room.myRole === 'OWNER' && <Crown className="h-3 w-3" />}
                      {ROOM_ROLE_LABELS[room.myRole]}
                    </Badge>
                  )}
                </div>
                {room.description && (
                  <p className="text-muted-foreground mb-4">{room.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {room.membersCount || members?.length || 0} membros
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleCopyInviteCode} className="gap-2">
                  <Copy className="h-4 w-4" />
                  <span className="font-mono">{room.inviteCode}</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(isOwner || isAdmin) && (
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Configurações
                      </DropdownMenuItem>
                    )}
                    {!isOwner && (
                      <DropdownMenuItem
                        onClick={() => setShowLeaveDialog(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair da Sala
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="members">Membros</TabsTrigger>
          </TabsList>

          <TabsContent value="ranking" className="mt-6">
            <RankingList roomId={roomId} />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Membros da Sala</CardTitle>
                <CardDescription>{members?.length || 0} participantes</CardDescription>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="mt-1 h-3 w-20" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {members?.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-4 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.user.avatarUrl} alt={member.user.name} />
                          <AvatarFallback>
                            {member.user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{member.user.name}</p>
                          <p className="text-xs text-muted-foreground">@{member.user.username}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>
                            {member.role === 'OWNER' && <Crown className="mr-1 h-3 w-3" />}
                            {ROOM_ROLE_LABELS[member.role]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Entrou {formatRelativeTime(member.joinedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Leave Room Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da sala?</AlertDialogTitle>
            <AlertDialogDescription>
              Você poderá entrar novamente usando o código de convite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveRoom}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sair da Sala
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
