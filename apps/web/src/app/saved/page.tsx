"use client";

import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { PostCard } from "@/components/post/PostCard";
import { PostCardSkeleton } from "@/components/post/PostCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Bookmark } from "lucide-react";
import { fetchSavedPosts } from "@/lib/bookmarks-api";
import { mapPostToCard } from "@/lib/posts";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

export default function SavedPage() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading } = useQuery({
    queryKey: ["bookmarks", accessToken],
    queryFn: () => fetchSavedPosts(accessToken!),
    enabled: !!accessToken,
  });

  const posts = data?.map(mapPostToCard) ?? [];

  return (
    <RequireAuth>
      <main className="container mx-auto px-4 max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Saved posts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Posts you bookmarked for later
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="Nothing saved yet"
            description="Tap the bookmark icon on any post to save it here."
            actionLabel="Explore feed"
            onAction={() => window.location.assign("/")}
          />
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <p className="text-center mt-10 text-sm text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            Back to feed
          </Link>
        </p>
      </main>
    </RequireAuth>
  );
}
