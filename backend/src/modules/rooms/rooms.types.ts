import { RoomVisibility, RoomMemberRole } from '@prisma/client';

export interface RoomDto {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  inviteCode: string;
  visibility: RoomVisibility;
  ownerId: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomDetailDto extends RoomDto {
  owner: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
}

export interface RoomMemberDto {
  id: string;
  userId: string;
  role: RoomMemberRole;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
}
