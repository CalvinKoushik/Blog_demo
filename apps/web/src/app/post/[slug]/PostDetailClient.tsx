"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  Share2,
  Bookmark,
  MoreHorizontal,
  ArrowLeft,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { fetchPostBySlug, deletePost } from "@/lib/posts-api";
import { mapPostToCard } from "@/lib/posts";
import { SafeHtml } from "@/components/post/SafeHtml";
import { CommentSection } from "@/components/post/CommentSection";
import { useAuthStore } from "@/store/useAuthStore";
import { likePost, unlikePost } from "@/lib/social-api";
import { bookmarkPost, unbookmarkPost } from "@/lib/bookmarks-api";
import { toast } from "sonner";

export function PostDetailClient() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", slug, accessToken],
    queryFn: () => fetchPostBySlug(slug, accessToken),
    enabled: !!slug,
  });

  const [bookmarked, setBookmarked] = useState(false);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Sign in to like");
      if (post?.likedByMe) return unlikePost(slug, accessToken);
      return likePost(slug, accessToken);
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["post", slug] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Sign in to save");
      if (bookmarked) return unbookmarkPost(slug, accessToken);
      return bookmarkPost(slug, accessToken);
    },
    onMutate: () => setBookmarked((b) => !b),
    onError: () => {
      setBookmarked(post?.bookmarkedByMe ?? false);
      toast.error("Could not update bookmark");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  useEffect(() => {
    if (post) setBookmarked(post.bookmarkedByMe ?? false);
  }, [post?.bookmarkedByMe, post]);

  const removePost = useMutation({
    mutationFn: () => deletePost(accessToken!, slug),
    onSuccess: () => {
      toast.success("Post removed");
      router.push("/");
    },
    onError: () => toast.error("Could not delete post"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <main className="container mx-auto px-4 max-w-4xl py-6 text-center">
        <p className="text-destructive mb-4">Post not found</p>
        <Link href="/" className="text-primary hover:underline">
          Back to feed
        </Link>
      </main>
    );
  }

  const profile = post.author.profile;
  const authorName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : "Unknown";
  const username = profile?.nickname ?? "user";
  const isAuthor = user?.id === post.author.id;
  const readTime = mapPostToCard(post).readTime;
  const likeCount = post._count?.likes ?? 0;

  return (
    <main className="container mx-auto px-4 max-w-4xl py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Feed
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.category && (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                {post.category.name}
              </Badge>
            )}
            <Badge variant="secondary">{post.type}</Badge>
            {!post.isPublished && <Badge variant="outline">Draft</Badge>}
            {post.techStack.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-border/50">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile?.avatarUrl ?? undefined} />
                <AvatarFallback>{authorName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={`/${username}`}
                  className="font-semibold hover:underline decoration-primary"
                >
                  {authorName}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()} · {readTime} ·{" "}
                  {post.viewCount} views
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={post.likedByMe ? "text-rose-500" : "text-muted-foreground"}
                disabled={likeMutation.isPending}
                onClick={() => likeMutation.mutate()}
              >
                <Heart className={`h-5 w-5 ${post.likedByMe ? "fill-rose-500" : ""}`} />
              </Button>
              <span className="text-sm font-medium tabular-nums">{likeCount}</span>
              {isAuthor && (
                <>
                  <Link href={`/post/${slug}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    disabled={removePost.isPending}
                    onClick={() => {
                      if (confirm("Remove this post?")) removePost.mutate();
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={bookmarked ? "text-primary" : "text-muted-foreground"}
                disabled={bookmarkMutation.isPending}
                onClick={() => bookmarkMutation.mutate()}
              >
                <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-primary" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {post.thumbnailUrl && (
          <div className="w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl mb-12 bg-muted">
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <SafeHtml
          html={post.content}
          className="prose prose-lg dark:prose-invert mx-auto max-w-none mb-16"
        />

        <Separator className="my-10" />
        <CommentSection slug={slug} />
      </article>
    </main>
  );
}
