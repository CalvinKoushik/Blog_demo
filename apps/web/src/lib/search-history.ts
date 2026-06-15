const KEY = "studenthub-recent-searches";
const MAX = 8;

export type RecentSearch = {
  q: string;
  type: "posts" | "people";
  at: number;
};

export function getRecentSearches(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecentSearch[]) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(q: string, type: "posts" | "people") {
  const trimmed = q.trim();
  if (!trimmed) return;
  const prev = getRecentSearches().filter(
    (s) => !(s.q === trimmed && s.type === type),
  );
  const next = [{ q: trimmed, type, at: Date.now() }, ...prev].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearRecentSearches() {
  localStorage.removeItem(KEY);
}
