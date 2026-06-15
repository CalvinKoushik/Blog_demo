"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Clock, FileText, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  addRecentSearch,
  getRecentSearches,
  clearRecentSearches,
} from "@/lib/search-history";
import { searchPeople } from "@/lib/users-api";
import { fetchFeedPosts } from "@/lib/posts-api";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

type Suggestion =
  | { kind: "recent"; q: string; type: "posts" | "people" }
  | { kind: "post"; title: string; slug: string }
  | { kind: "person"; name: string; username: string };

export function NavbarSearch({ className }: { className?: string }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebouncedValue(q, 320);
  const containerRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback(
    (query: string, type: "posts" | "people" = "posts") => {
      const trimmed = query.trim();
      if (!trimmed) return;
      addRecentSearch(trimmed, type);
      setOpen(false);
      setQ("");
      router.push(
        `/search?type=${type}&q=${encodeURIComponent(trimmed)}`,
      );
    },
    [router],
  );

  useEffect(() => {
    if (!debounced.trim()) {
      const timer = setTimeout(() => {
        setSuggestions(
          getRecentSearches().map((r) => ({
            kind: "recent" as const,
            q: r.q,
            type: r.type,
          })),
        );
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const [postsRes, peopleRes] = await Promise.all([
          fetchFeedPosts(accessToken, { q: debounced, limit: 4 }),
          searchPeople(debounced, accessToken),
        ]);
        if (cancelled) return;
        const items: Suggestion[] = [
          ...postsRes.items.slice(0, 3).map((p) => ({
            kind: "post" as const,
            title: p.title,
            slug: p.slug,
          })),
          ...peopleRes.items.slice(0, 3).map((p) => ({
            kind: "person" as const,
            name: `${p.firstName} ${p.lastName}`,
            username: p.username ?? "",
          })),
        ];
        setSuggestions(items);
        setActiveIndex(0);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced, accessToken]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown") setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(0, suggestions.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = suggestions[activeIndex];
      if (!item) {
        navigate(q, "posts");
        return;
      }
      if (item.kind === "recent") navigate(item.q, item.type);
      else if (item.kind === "post") {
        setOpen(false);
        router.push(`/post/${item.slug}`);
      } else if (item.kind === "person") {
        setOpen(false);
        router.push(`/${item.username}`);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search posts or people..."
          className="w-full pl-10 pr-9 bg-muted/40 border-border/50 focus-visible:bg-background transition-colors h-10 rounded-full"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {q && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted"
            onClick={() => setQ("")}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border/60 bg-popover/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {loading && (
            <p className="px-4 py-3 text-xs text-muted-foreground">Searching...</p>
          )}
          {!loading && suggestions.length === 0 && debounced.trim() && (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">
              No quick matches — press Enter for full search
            </p>
          )}
          <ul className="max-h-[320px] overflow-y-auto py-1">
            {suggestions.map((item, i) => {
              const active = i === activeIndex;
              if (item.kind === "recent") {
                return (
                  <li key={`r-${item.q}-${item.type}`}>
                    <button
                      type="button"
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted/60 transition-colors",
                        active && "bg-muted/80",
                      )}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => navigate(item.q, item.type)}
                    >
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{item.q}</span>
                      <span className="text-xs text-muted-foreground ml-auto capitalize">
                        {item.type}
                      </span>
                    </button>
                  </li>
                );
              }
              if (item.kind === "post") {
                return (
                  <li key={`p-${item.slug}`}>
                    <Link
                      href={`/post/${item.slug}`}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors",
                        active && "bg-muted/80",
                      )}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => setOpen(false)}
                    >
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </li>
                );
              }
              return (
                <li key={`u-${item.username}`}>
                  <Link
                    href={`/${item.username}`}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors",
                      active && "bg-muted/80",
                    )}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => setOpen(false)}
                  >
                    <Users className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border/50 p-2 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex-1 rounded-lg text-xs"
              onClick={() => navigate(q || debounced, "posts")}
            >
              Search posts
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex-1 rounded-lg text-xs"
              onClick={() => navigate(q || debounced, "people")}
            >
              Search people
            </Button>
          </div>
          {getRecentSearches().length > 0 && !debounced.trim() && (
            <button
              type="button"
              className="w-full text-xs text-muted-foreground py-2 hover:text-foreground border-t border-border/40"
              onClick={() => {
                clearRecentSearches();
                setSuggestions([]);
              }}
            >
              Clear recent searches
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function MobileSearchButton() {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden text-muted-foreground"
      onClick={() => router.push("/search")}
      aria-label="Search"
    >
      <Search className="h-5 w-5" />
    </Button>
  );
}
