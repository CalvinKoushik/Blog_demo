import { apiFetch } from "./api";
import type { AuthUser, AuthTokens } from "@/types/auth";

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nickname: string;
  collegeName: string;
  department: string;
  year: number;
  linkedinUrl: string;
  githubUrl?: string;
  bio?: string;
  skills?: string[];
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = AuthTokens & { user: AuthUser };

export function register(payload: RegisterPayload) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginPayload) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function refreshSession(refreshToken: string) {
  return apiFetch<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function fetchMe(accessToken: string) {
  return apiFetch<AuthUser>("/auth/me", { token: accessToken });
}

export function logout(accessToken: string) {
  return apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
    token: accessToken,
  });
}
