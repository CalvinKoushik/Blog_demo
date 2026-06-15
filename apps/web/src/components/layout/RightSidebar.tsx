"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TrendingUp, UserPlus, Hash } from "lucide-react";
import {
  fetchTrendingCategories,
  fetchTrendingTags,
  fetchSuggestedCreators,
} from "@/lib/discover-api";
import { useAuthStore } from "@/store/useAuthStore";
import { FollowButton } from "@/components/profile/FollowButton";

export function RightSidebar() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: categories } = useQuery({
    queryKey: ["trending-categories"],
    queryFn: fetchTrendingCategories,
    staleTime: 60_000,
  });

  const { data: tags } = useQuery({
    queryKey: ["trending-tags"],
    queryFn: fetchTrendingTags,
    staleTime: 60_000,
  });

  const { data: creators } = useQuery({
    queryKey: ["suggested-creators", accessToken],
    queryFn: () => fetchSuggestedCreators(accessToken),
    staleTime: 60_000,
  });

  return (
    <aside className="w-80 shrink-0 hidden xl:block">
      <div className="sticky top-24 space-y-6">
        <div className="bg-card/50 backdrop-blur-md rounded-xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Trending categories</h3>
          </div>
          <div className="space-y-3">
            {categories?.length ? (
              categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/search?category=${c.slug}`}
                  className="group block rounded-lg p-2 -mx-2 hover:bg-muted/50 transition-colors"
                >
                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                    {c.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.postCount} posts
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No trends yet</p>
            )}
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-md rounded-xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Trending tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags?.length ? (
              tags.map((t) => (
                <Link
                  key={t.tag}
                  href={`/search?q=${encodeURIComponent(t.tag)}`}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {t.tag}
                </Link>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No tags yet</p>
            )}
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-md rounded-xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Suggested creators</h3>
          </div>
          <div className="space-y-4">
            {creators?.length ? (
              creators.map((c) => (
                <div key={c.userId} className="flex items-center justify-between gap-2">
                  <Link
                    href={`/${c.username}`}
                    className="flex items-center gap-3 group min-w-0"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={c.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {c.firstName[0]}
                        {c.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {c.firstName} {c.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.postCount} posts · {c.followerCount} followers
                      </p>
                    </div>
                  </Link>
                  {c.username && (
                    <div className="shrink-0 scale-90 origin-right">
                      <FollowButton username={c.username} compact />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">Check back soon</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
