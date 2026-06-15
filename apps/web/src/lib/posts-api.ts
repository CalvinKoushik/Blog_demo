import { apiFetch } from "./api";

import type { ApiCategory, ApiPost, CreatePostPayload, UpdatePostPayload } from "@/types/post";



export type PaginatedPosts = {

  items: ApiPost[];

  nextCursor: string | null;

};



export type FeedParams = {

  feed?: "following";

  q?: string;

  category?: string;

  type?: string;

  cursor?: string;

  limit?: number;

};



function buildQuery(params: FeedParams) {

  const qs = new URLSearchParams();

  if (params.feed) qs.set("feed", params.feed);

  if (params.q) qs.set("q", params.q);

  if (params.category) qs.set("category", params.category);

  if (params.type) qs.set("type", params.type);

  if (params.cursor) qs.set("cursor", params.cursor);

  if (params.limit) qs.set("limit", String(params.limit));

  const s = qs.toString();

  return s ? `?${s}` : "";

}



export function fetchFeedPosts(token?: string | null, params: FeedParams = {}) {

  return apiFetch<PaginatedPosts>(`/posts${buildQuery(params)}`, {

    token: token ?? undefined,

  });

}



export function fetchMyPosts(token: string, published?: boolean) {

  const qs =

    published === true

      ? "?published=true"

      : published === false

        ? "?published=false"

        : "";

  return apiFetch<ApiPost[]>(`/posts/me${qs}`, { token });

}



export function fetchPostBySlug(slug: string, token?: string | null) {

  return apiFetch<ApiPost>(`/posts/${slug}`, { token: token ?? undefined });

}



export function fetchCategories() {

  return apiFetch<ApiCategory[]>("/posts/categories");

}



export function createPost(token: string, payload: CreatePostPayload) {

  return apiFetch<ApiPost>("/posts", {

    method: "POST",

    token,

    body: JSON.stringify(payload),

  });

}



export function updatePost(token: string, slug: string, payload: UpdatePostPayload) {

  return apiFetch<ApiPost>(`/posts/${slug}`, {

    method: "PATCH",

    token,

    body: JSON.stringify(payload),

  });

}



export function deletePost(token: string, slug: string) {

  return apiFetch<{ message: string }>(`/posts/${slug}`, {

    method: "DELETE",

    token,

  });

}

