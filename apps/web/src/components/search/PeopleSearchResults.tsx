"use client";

import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserSearch, Loader2 } from "lucide-react";
import { searchPeople } from "@/lib/users-api";
import { useAuthStore } from "@/store/useAuthStore";
import { FollowButton } from "@/components/profile/FollowButton";
import { motion } from "framer-motion";

export function PeopleSearchResults({ query }: { query: string }) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["people-search", query, accessToken],
      queryFn: ({ pageParam }) =>
        searchPeople(query, accessToken, pageParam as string | undefined),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      enabled: query.length >= 1,
    });

  const people = data?.pages.flatMap((p) => p.items) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center py-10 text-destructive text-sm">
        Could not search people. Try again.
      </p>
    );
  }

  if (!people.length) {
    return (
      <EmptyState
        icon={UserSearch}
        title="No people found"
        description="Try another username, skill, college, or department."
      />
    );
  }

  return (
    <div className="space-y-3">
      {people.map((person, i) => (
        <motion.div
          key={person.userId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.15) }}
          className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/30 hover:shadow-sm transition-all"
        >
          <Link href={`/${person.username}`} className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={person.avatarUrl ?? undefined} />
              <AvatarFallback>
                {person.firstName[0]}
                {person.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold truncate">
                {person.firstName} {person.lastName}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                @{person.username}
                {person.collegeName ? ` · ${person.collegeName}` : ""}
              </p>
              {person.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {person.skills.slice(0, 3).map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {person.postCount} posts · {person.followerCount} followers
              </p>
            </div>
          </Link>
          {person.username && (
            <FollowButton username={person.username} compact />
          )}
        </motion.div>
      ))}
      {hasNextPage && (
        <button
          type="button"
          className="w-full py-3 text-sm text-primary font-medium hover:underline"
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
        >
          {isFetchingNextPage ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          ) : (
            "Load more"
          )}
        </button>
      )}
    </div>
  );
}
