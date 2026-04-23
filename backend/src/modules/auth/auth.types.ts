export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    avatarUrl: string | null;
  };
  token: string;
}
