"use client";

import { useEffect, useRef, memo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/post/PostCard";
import { PostCardSkeleton } from "@/components/post/PostCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users, Loader2 } from "lucide-react";
import { fetchFeedPosts, type FeedParams } from "@/lib/posts-api";
import { mapPostToCard } from "@/lib/posts";
import type { FeedPostCard } from "@/types/post";

const FeedItem = memo(function FeedItem({
  post,
  animate,
}: {
  post: FeedPostCard;
  animate: boolean;
}) {
  if (!animate) {
    return <PostCard post={post} />;
  }
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
      <PostCard post={post} />
    </div>
  );
});

type FeedListProps = {
  queryKey: unknown[];
  params: FeedParams;
  token?: string | null;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
};

export function FeedList({
  queryKey,
  params,
  token,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
}: FeedListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchFeedPosts(token, {
        ...params,
        cursor: pageParam as string | undefined,
        limit: 10,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
  });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "280px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const posts = data?.pages.flatMap((p) => p.items.map(mapPostToCard)) ?? [];
  const firstPageCount = data?.pages[0]?.items.length ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center py-10 text-destructive text-sm">
        Failed to load posts. Try again shortly.
      </p>
    );
  }

  if (!posts.length) {
    return (
      <EmptyState
        icon={Users}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post, i) => (
        <FeedItem
          key={post.id}
          post={post}
          animate={i < firstPageCount && i < 6}
        />
      ))}
      <div ref={sentinelRef} className="h-1 w-full" aria-hidden />
      {isFetchingNextPage && (
        <div className="space-y-6 pt-2">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      )}
      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-4">
          You&apos;re all caught up
        </p>
      )}
    </div>
  );
}
