"use client";

import { memo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Heart, Share2, Bookmark } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { likePost, unlikePost } from "@/lib/social-api";
import { bookmarkPost, unbookmarkPost } from "@/lib/bookmarks-api";
import { toast } from "sonner";
import type { FeedPostCard } from "@/types/post";

function PostCardInner({ post }: { post: FeedPostCard }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  const [isLiked, setIsLiked] = useState(post.likedByMe ?? false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isBookmarked, setIsBookmarked] = useState(post.bookmarkedByMe ?? false);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Sign in to like posts");
      if (isLiked) return unlikePost(post.slug, accessToken);
      return likePost(post.slug, accessToken);
    },
    onMutate: () => {
      const next = !isLiked;
      setIsLiked(next);
      setLikesCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
    },
    onError: () => {
      setIsLiked(isLiked);
      setLikesCount(post.likes);
      toast.error("Could not update like");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Sign in to save posts");
      if (isBookmarked) return unbookmarkPost(post.slug, accessToken);
      return bookmarkPost(post.slug, accessToken);
    },
    onMutate: () => setIsBookmarked((b) => !b),
    onError: () => {
      setIsBookmarked(isBookmarked);
      toast.error("Could not update bookmark");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Sign in to like posts");
      return;
    }
    likeMutation.mutate();
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Sign in to save posts");
      return;
    }
    bookmarkMutation.mutate();
  };

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden group border-border/40 bg-card/50 backdrop-blur-sm">
        {post.thumbnail && (
          <Link href={`/post/${post.slug}`}>
            <div className="w-full h-48 sm:h-56 overflow-hidden bg-muted relative">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Link>
        )}

        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between mb-2">
            <Link href={`/${post.author.username}`} className="flex items-center gap-3 group/author">
              <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover/author:ring-primary/20 transition-all">
                <AvatarImage src={post.author.avatar ?? undefined} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold leading-none mb-1 group-hover/author:text-primary transition-colors">
                  {post.author.name}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {post.author.role} · {post.timeAgo}
                </p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              disabled={bookmarkMutation.isPending}
              className={cn(
                "rounded-full transition-all active:scale-90",
                isBookmarked ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary",
              )}
            >
              <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-primary")} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0">
          <Link href={`/post/${post.slug}`}>
            <h2 className="text-xl sm:text-2xl font-extrabold mb-3 group-hover:text-primary transition-colors leading-tight">
              {post.title}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base line-clamp-2 mb-5 leading-relaxed">
              {post.excerpt}
            </p>
          </Link>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-primary/5 text-primary/80 border-primary/10 font-medium">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0 flex items-center justify-between border-t border-border/30 mt-2 h-14 bg-muted/10">
          <div className="flex items-center gap-1 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className={cn(
                "gap-2 rounded-full transition-all active:scale-95",
                isLiked ? "text-rose-500 bg-rose-500/10" : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10",
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-rose-500")} />
              <span className="font-semibold tabular-nums">{likesCount}</span>
            </Button>
            <Link href={`/post/${post.slug}#comments`}>
              <Button variant="ghost" size="sm" className="gap-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10">
                <MessageSquare className="h-4 w-4" />
                <span className="font-semibold tabular-nums">{post.comments}</span>
              </Button>
            </Link>
          </div>
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">{post.readTime}</span>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export const PostCard = memo(PostCardInner);
