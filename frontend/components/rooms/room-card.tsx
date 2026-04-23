'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ROOM_VISIBILITY_LABELS, ROOM_ROLE_LABELS } from '@/lib/format'
import type { Room } from '@/types/api'
import { Users, Lock, Globe, Crown } from 'lucide-react'

interface RoomCardProps {
  room: Room
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <Link href={`/dashboard/rooms/${room.id}`}>
      <Card className="group h-full transition-all hover:shadow-lg hover:border-primary/30">
        {room.coverImageUrl && (
          <div className="relative h-32 overflow-hidden rounded-t-lg">
            <img
              src={room.coverImageUrl}
              alt={room.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="font-semibold text-white truncate">{room.name}</h3>
            </div>
          </div>
        )}
        <CardContent className={room.coverImageUrl ? 'p-4' : 'p-5'}>
          {!room.coverImageUrl && (
            <h3 className="font-semibold text-foreground mb-2 truncate">{room.name}</h3>
          )}
          
          {room.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {room.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{room.membersCount || 0}</span>
            </div>
          </div>

          {room.owner && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Avatar className="h-6 w-6">
                <AvatarImage src={room.owner.avatarUrl} alt={room.owner.name} />
                <AvatarFallback className="text-xs">
                  {room.owner.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                Criada por <span className="font-medium text-foreground">{room.owner.name}</span>
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
