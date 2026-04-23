export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  institution: string | null;
  course: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}
