import { apiFetch } from "./api";

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  bio?: string;
  collegeName?: string;
  department?: string;
  year?: number;
  skills?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  avatarUrl?: string;
};

export type PersonSearchResult = {
  userId: string;
  firstName: string;
  lastName: string;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  collegeName: string | null;
  department: string | null;
  skills: string[];
  postCount: number;
  followerCount: number;
  following: boolean;
};

export type PaginatedPeople = {
  items: PersonSearchResult[];
  nextCursor: string | null;
};

export function searchPeople(
  q: string,
  token?: string | null,
  cursor?: string,
) {
  const qs = new URLSearchParams({ q });
  if (cursor) qs.set("cursor", cursor);
  return apiFetch<PaginatedPeople>(`/users/search?${qs}`, {
    token: token ?? undefined,
  });
}

export function fetchUserActivity(username: string) {
  return apiFetch<{
    recentPosts: unknown[];
    recentComments: unknown[];
    likedPosts: unknown[];
    timeline: Array<{
      type: "post" | "comment" | "like";
      id: string;
      createdAt: string;
      post?: { title?: string; slug?: string };
      comment?: { content?: string };
    }>;
  }>(`/users/${username}/activity`);
}

export function updateMyProfile(token: string, payload: UpdateProfilePayload) {
  return apiFetch("/users/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}
