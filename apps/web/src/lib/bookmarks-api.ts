import { apiFetch } from "./api";
import type { ApiPost } from "@/types/post";

export function fetchSavedPosts(token: string) {
  return apiFetch<ApiPost[]>("/bookmarks", { token });
}

export function fetchBookmarkStatus(slug: string, token?: string | null) {
  return apiFetch<{ bookmarked: boolean }>(`/posts/${slug}/bookmark`, {
    token: token ?? undefined,
  });
}

export function bookmarkPost(slug: string, token: string) {
  return apiFetch<{ bookmarked: boolean }>(`/posts/${slug}/bookmark`, {
    method: "POST",
    token,
  });
}

export function unbookmarkPost(slug: string, token: string) {
  return apiFetch<{ bookmarked: boolean }>(`/posts/${slug}/bookmark`, {
    method: "DELETE",
    token,
  });
}
