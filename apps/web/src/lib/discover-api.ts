import { apiFetch } from "./api";

export type TrendingCategory = {
  id: string;
  name: string;
  slug: string;
  postCount: number;
};

export type TrendingTag = { tag: string; count: number };

export type SuggestedCreator = {
  userId: string;
  firstName: string;
  lastName: string;
  username: string | null;
  avatarUrl: string | null;
  collegeName: string | null;
  department: string | null;
  postCount: number;
  followerCount: number;
};

export function fetchTrendingCategories() {
  return apiFetch<TrendingCategory[]>("/discover/trending-categories");
}

export function fetchTrendingTags() {
  return apiFetch<TrendingTag[]>("/discover/trending-tags");
}

export function fetchSuggestedCreators(token?: string | null) {
  return apiFetch<SuggestedCreator[]>("/discover/suggested-creators", {
    token: token ?? undefined,
  });
}
