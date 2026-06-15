"use client";

import { useState, useEffect } from "react";
import { useDraftAutosave } from "@/hooks/useDraftAutosave";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Editor } from "@/components/post/Editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Send, X, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/upload/ImageUpload";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { createPost, fetchCategories } from "@/lib/posts-api";
import { ApiError } from "@/lib/api";
import { POST_TYPE_OPTIONS, type PostType } from "@/types/post-enums";

export default function NewPostPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [postType, setPostType] = useState<PostType>("BLOG");
  const [tags, setTags] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [showRestore, setShowRestore] = useState(false);

  const draft = useDraftAutosave("draft:post:new", {
    title,
    content,
    categorySlug,
    postType,
    tags,
    thumbnailUrl,
    updatedAt: Date.now(),
  });

  useEffect(() => {
    const saved = draft.restoreDraft();
    if (saved && saved.updatedAt && Date.now() - saved.updatedAt < 7 * 86400000) {
      setShowRestore(true);
    }
  }, []);

  useEffect(() => {
    if (!draft.dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [draft.dirty]);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const submitPost = async (publish: boolean) => {
    if (!accessToken) {
      toast.error("Please sign in to publish");
      return;
    }
    if (!title.trim()) {
      toast.error("Add a title");
      return;
    }
    if (!categorySlug) {
      toast.error("Select a category");
      return;
    }
    const plain = content.replace(/<[^>]+>/g, "").trim();
    if (plain.length < 10) {
      toast.error("Write more content before publishing");
      return;
    }

    const techStack = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setIsPublishing(true);
    try {
      const post = await createPost(accessToken, {
        title: title.trim(),
        content,
        categorySlug,
        type: postType,
        techStack: techStack.length > 0 ? techStack : undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        isPublished: publish,
      });
      draft.clearDraft();
      toast.success(publish ? "Post published!" : "Draft saved!");
      router.push(`/post/${post.slug}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to publish");
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublish = () => void submitPost(true);
  const handleSaveDraft = () => void submitPost(false);

  return (
    <RequireAuth>
      <main className="container mx-auto px-4 max-w-5xl py-4 sm:py-8">
        {showRestore && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
            <span>A saved draft was found on this device.</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => setShowRestore(false)}
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => {
                  const saved = draft.restoreDraft();
                  if (saved) {
                    setTitle(saved.title);
                    setContent(saved.content);
                    setCategorySlug(saved.categorySlug);
                    setPostType(saved.postType as PostType);
                    setTags(saved.tags);
                    setThumbnailUrl(saved.thumbnailUrl);
                  }
                  setShowRestore(false);
                  draft.markClean();
                }}
              >
                Restore
              </Button>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
                <X className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Draft a New Post
              </h1>
              {draft.dirty && (
                <p className="text-xs text-muted-foreground mt-1">
                  {draft.lastSaved
                    ? `Autosaved ${new Date(draft.lastSaved).toLocaleTimeString()}`
                    : "Unsaved changes"}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={handleSaveDraft}
              disabled={isPublishing}
            >
              Save draft
            </Button>
            <Button
              className="gap-2 rounded-full shadow-md px-6"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isPublishing ? "Publishing..." : "Publish"}
              </span>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          <div>
            <Input
              placeholder="Post Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl sm:text-5xl font-extrabold h-auto py-2 border-none shadow-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/40 bg-transparent"
            />
          </div>

          {accessToken && (
            <ImageUpload
              token={accessToken}
              folder="thumbnails"
              value={thumbnailUrl}
              onChange={setThumbnailUrl}
              label="Cover image"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card/40 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-border/50 shadow-sm">
            <div className="space-y-3">
              <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </Label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                required
                disabled={categoriesLoading}
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select a category</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Post type
              </Label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value as PostType)}
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {POST_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Tags (comma separated)
              </Label>
              <Input
                placeholder="e.g. Next.js, React, Tutorial"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="h-12 rounded-xl bg-background border-border/50"
              />
            </div>
          </div>

          <div className="mt-8 pb-32">
            <Editor onChange={setContent} />
          </div>
        </motion.div>
      </main>
    </RequireAuth>
  );
}
