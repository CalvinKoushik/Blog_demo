"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import { FeedList } from "@/components/feed/FeedList";
import { PeopleSearchResults } from "@/components/search/PeopleSearchResults";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/posts-api";
import { POST_TYPE_OPTIONS, type PostType } from "@/types/post-enums";
import { useAuthStore } from "@/store/useAuthStore";
import { addRecentSearch, getRecentSearches } from "@/lib/search-history";
import { motion, AnimatePresence } from "framer-motion";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const urlQ = searchParams.get("q") ?? "";
  const urlMode = searchParams.get("type") === "people" ? "people" : "posts";
  const urlCategory = searchParams.get("category") ?? "";
  const urlPostType = POST_TYPE_OPTIONS.some(
    (o) => o.value === searchParams.get("type"),
  )
    ? (searchParams.get("type") as PostType)
    : "";

  const [tab, setTab] = useState<"posts" | "people">(urlMode);
  const [q, setQ] = useState(urlQ);
  const [category, setCategory] = useState(urlCategory);
  const [postType, setPostType] = useState(urlPostType);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTab(urlMode);
      setQ(urlQ);
      setCategory(urlCategory);
      setPostType(urlPostType);
    }, 0);
    return () => clearTimeout(timer);
  }, [urlMode, urlQ, urlCategory, urlPostType]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const runSearch = () => {
    const params = new URLSearchParams();
    if (q.trim()) {
      params.set("q", q.trim());
      addRecentSearch(q.trim(), tab);
    }
    if (tab === "people") {
      params.set("type", "people");
    } else {
      if (postType) params.set("type", postType);
      else params.set("type", "posts");
      if (category) params.set("category", category);
    }
    router.push(`/search?${params.toString()}`);
  };

  const hasQ = !!searchParams.get("q")?.trim();
  const mode = searchParams.get("type") === "people" ? "people" : "posts";
  const filterType = POST_TYPE_OPTIONS.some((o) => o.value === searchParams.get("type"))
    ? (searchParams.get("type") as PostType)
    : undefined;

  const recent = getRecentSearches();

  return (
    <main className="container mx-auto px-4 max-w-2xl py-8">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold tracking-tight mb-6"
      >
        Search
      </motion.h1>

      <div className="rounded-2xl border border-border/50 bg-card/50 p-5 mb-6 space-y-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              tab === "people"
                ? "Username, skills, college, department..."
                : "Search posts..."
            }
            className="pl-10 rounded-full h-11"
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
          />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "posts" | "people")}>
          <TabsList className="w-full grid grid-cols-2 rounded-xl">
            <TabsTrigger value="posts" className="rounded-lg">
              Posts
            </TabsTrigger>
            <TabsTrigger value="people" className="rounded-lg">
              People
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Category
                </Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-xl border px-3 text-sm bg-background"
                >
                  <option value="">All</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Post type
                </Label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as PostType | "")}
                  className="mt-1 flex h-10 w-full rounded-xl border px-3 text-sm bg-background"
                >
                  <option value="">All types</option>
                  {POST_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button className="rounded-full w-full sm:w-auto" onClick={runSearch}>
          Search
        </Button>
      </div>

      {recent.length > 0 && !hasQ && (
        <div className="mb-8 flex flex-wrap gap-2">
          {recent.map((r) => (
            <button
              key={`${r.q}-${r.type}-${r.at}`}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() =>
                router.push(`/search?type=${r.type}&q=${encodeURIComponent(r.q)}`)
              }
            >
              <Clock className="h-3 w-3" />
              {r.q}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {hasQ && mode === "people" ? (
          <motion.div
            key="people"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PeopleSearchResults query={searchParams.get("q")!.trim()} />
          </motion.div>
        ) : hasQ || searchParams.get("category") || filterType ? (
          <motion.div
            key="posts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FeedList
              queryKey={[
                "search",
                searchParams.get("q"),
                searchParams.get("category"),
                searchParams.get("type"),
                accessToken,
              ]}
              params={{
                q: searchParams.get("q") ?? undefined,
                category: searchParams.get("category") ?? undefined,
                type: filterType,
              }}
              token={accessToken}
              emptyTitle="No posts found"
              emptyDescription="Try different keywords or filters."
              emptyActionLabel="Browse feed"
              onEmptyAction={() => router.push("/")}
            />
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground py-16 text-sm leading-relaxed"
          >
            Search posts by topic or find students by username, skills, and college.
          </motion.p>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-20 flex justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
