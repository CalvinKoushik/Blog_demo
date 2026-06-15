"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createComment,
  deleteComment,
  fetchComments,
  type ApiComment,
} from "@/lib/social-api";
import { useAuthStore } from "@/store/useAuthStore";
import { SafeHtml } from "./SafeHtml";
import { sanitizeHtml } from "@/lib/sanitize";

function commentAuthorName(c: ApiComment) {
  if (c.author?.profile) {
    const p = c.author.profile;
    return `${p.firstName} ${p.lastName}`;
  }
  return c.guestName ?? "Guest";
}

function CommentItem({
  comment,
  slug,
  onReply,
}: {
  comment: ApiComment;
  slug: string;
  onReply: (parentId: string) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const remove = useMutation({
    mutationFn: () => deleteComment(comment.id, accessToken!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["comments", slug] });
      void queryClient.invalidateQueries({ queryKey: ["post", slug] });
    },
    onError: () => toast.error("Could not delete comment"),
  });

  const canDelete = user?.id && comment.author;

  return (
    <div className="space-y-3 py-4 border-b border-border/40 last:border-0">
      <div className="flex gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={comment.author?.profile?.avatarUrl ?? undefined} />
          <AvatarFallback>{commentAuthorName(comment)[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold">{commentAuthorName(comment)}</p>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
          <SafeHtml
            html={comment.content}
            className="prose prose-sm dark:prose-invert max-w-none text-foreground"
          />
          <div className="flex gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onReply(comment.id)}
            >
              Reply
            </Button>
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-destructive"
                disabled={remove.isPending}
                onClick={() => remove.mutate()}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <div key={reply.id} className="ml-12 pl-4 border-l border-border/50">
          <CommentItem comment={reply} slug={slug} onReply={onReply} />
        </div>
      ))}
    </div>
  );
}

export function CommentSection({ slug }: { slug: string }) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  const [content, setContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", slug],
    queryFn: () => fetchComments(slug),
  });

  const addComment = useMutation({
    mutationFn: () =>
      createComment(
        slug,
        {
          content: sanitizeHtml(content),
          parentId: replyTo ?? undefined,
          guestName: !isAuthenticated ? guestName : undefined,
        },
        accessToken,
      ),
    onSuccess: () => {
      setContent("");
      setReplyTo(null);
      void queryClient.invalidateQueries({ queryKey: ["comments", slug] });
      void queryClient.invalidateQueries({ queryKey: ["post", slug] });
      toast.success("Comment posted");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to post comment"),
  });

  const handleSubmit = () => {
    const plain = content.replace(/<[^>]+>/g, "").trim();
    if (plain.length < 1) {
      toast.error("Write a comment first");
      return;
    }
    if (!isAuthenticated && !guestName.trim()) {
      toast.error("Enter your name to comment as a guest");
      return;
    }
    addComment.mutate();
  };

  return (
    <section id="comments" className="max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold mb-6">Discussion</h3>

      <div className="rounded-2xl border border-border/50 bg-card/50 p-4 mb-8 space-y-3">
        {replyTo && (
          <p className="text-xs text-muted-foreground">
            Replying to a comment{" "}
            <button
              type="button"
              className="text-primary underline"
              onClick={() => setReplyTo(null)}
            >
              cancel
            </button>
          </p>
        )}
        {!isAuthenticated && (
          <input
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
            placeholder="Your name (guest)"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
        )}
        <Textarea
          placeholder={
            isAuthenticated
              ? "Share your thoughts..."
              : "Comment as guest (sign in for full features)"
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <Button
          className="rounded-full"
          disabled={addComment.isPending}
          onClick={handleSubmit}
        >
          {addComment.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Post comment"
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !comments?.length ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No comments yet. Start the conversation.
        </p>
      ) : (
        <div>
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              slug={slug}
              onReply={setReplyTo}
            />
          ))}
        </div>
      )}
    </section>
  );
}
