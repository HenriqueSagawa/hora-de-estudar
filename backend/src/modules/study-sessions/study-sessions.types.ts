import { StudySessionSource } from '@prisma/client';

export interface StudySessionDto {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  subject: string | null;
  studyType: string | null;
  source: StudySessionSource;
  durationSeconds: number;
  startedAt: Date | null;
  endedAt: Date | null;
  studyDate: Date;
  focusLevel: number | null;
  roomId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActiveTimerDto {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  subject: string | null;
  studyType: string | null;
  roomId: string | null;
  status: string;
  startedAt: Date;
  totalPausedSeconds: number;
  lastPausedAt: Date | null;
  elapsedSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}
