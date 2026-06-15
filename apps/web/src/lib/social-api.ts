import { apiFetch } from "./api";

export interface ApiComment {
  id: string;
  content: string;
  createdAt: string;
  guestName: string | null;
  author: {
    profile: {
      firstName: string;
      lastName: string;
      nickname: string | null;
      avatarUrl: string | null;
    } | null;
  } | null;
  replies?: ApiComment[];
}

export function fetchComments(slug: string) {
  return apiFetch<ApiComment[]>(`/posts/${slug}/comments`);
}

export function createComment(
  slug: string,
  payload: { content: string; parentId?: string; guestName?: string },
  token?: string | null,
) {
  return apiFetch<ApiComment>(`/posts/${slug}/comments`, {
    method: "POST",
    token: token ?? undefined,
    body: JSON.stringify(payload),
  });
}

export function deleteComment(id: string, token: string) {
  return apiFetch<{ message: string }>(`/comments/${id}`, {
    method: "DELETE",
    token,
  });
}

export function fetchLikeStatus(slug: string, token?: string | null) {
  return apiFetch<{ likes: number; likedByMe: boolean }>(
    `/posts/${slug}/like`,
    { token: token ?? undefined },
  );
}

export function likePost(slug: string, token: string) {
  return apiFetch<{ likes: number; likedByMe: boolean }>(
    `/posts/${slug}/like`,
    { method: "POST", token },
  );
}

export function unlikePost(slug: string, token: string) {
  return apiFetch<{ likes: number; likedByMe: boolean }>(
    `/posts/${slug}/like`,
    { method: "DELETE", token },
  );
}

export function fetchFollowStatus(username: string, token?: string | null) {
  return apiFetch<{ following: boolean }>(`/users/${username}/follow`, {
    token: token ?? undefined,
  });
}

export function followUser(username: string, token: string) {
  return apiFetch<{ following: boolean }>(`/users/${username}/follow`, {
    method: "POST",
    token,
  });
}

export function unfollowUser(username: string, token: string) {
  return apiFetch<{ following: boolean }>(`/users/${username}/follow`, {
    method: "DELETE",
    token,
  });
}

export interface ApiNotification {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW" | "FEATURE";
  entityId: string | null;
  actorId: string | null;
  isRead: boolean;
  createdAt: string;
}

export function fetchNotifications(token: string) {
  return apiFetch<ApiNotification[]>("/notifications", { token });
}

export function fetchUnreadCount(token: string) {
  return apiFetch<{ count: number }>("/notifications/unread-count", { token });
}

export function markAllNotificationsRead(token: string) {
  return apiFetch("/notifications/read-all", { method: "PATCH", token });
}

export function markNotificationRead(id: string, token: string) {
  return apiFetch(`/notifications/${id}/read`, { method: "PATCH", token });
}
