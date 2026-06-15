export type UserRole = "ADMIN" | "STUDENT" | "VISITOR";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  collegeName: string | null;
  department: string | null;
  year: number | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
