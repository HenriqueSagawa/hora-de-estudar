export interface RankingEntry {
  position: number;
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  totalSeconds: number;
  totalHours: number;
  totalSessions: number;
  breakdown: {
    manual: { totalSeconds: number; count: number };
    timer: { totalSeconds: number; count: number };
  };
}
