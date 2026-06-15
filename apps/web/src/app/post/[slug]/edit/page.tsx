"use client";

import { useEffect, useState } from "react";
import { useDraftAutosave } from "@/hooks/useDraftAutosave";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Editor } from "@/components/post/Editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Send, X } from "lucide-react";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import {
  fetchPostBySlug,
  fetchCategories,
  updatePost,
} from "@/lib/posts-api";
import { ApiError } from "@/lib/api";
import { POST_TYPE_OPTIONS, type PostType } from "@/types/post-enums";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [postType, setPostType] = useState<PostType>("BLOG");
  const [tags, setTags] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [postReady, setPostReady] = useState(false);

  const draft = useDraftAutosave(
    `draft:post:edit:${slug}`,
    {
      title,
      content,
      categorySlug,
      postType,
      tags,
      thumbnailUrl,
      updatedAt: Date.now(),
    },
    { enabled: postReady },
  );

  useEffect(() => {
    if (!draft.dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [draft.dirty]);

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", slug, accessToken],
    queryFn: () => fetchPostBySlug(slug, accessToken),
    enabled: !!slug && !!accessToken,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    if (!post) return;
    if (user?.id !== post.author.id) {
      toast.error("You can only edit your own posts");
      router.push(`/post/${slug}`);
      return;
    }
    setTitle(post.title);
    setContent(post.content);
    setCategorySlug(post.category?.slug ?? "");
    setPostType(post.type);
    setTags(post.techStack?.join(", ") ?? "");
    setThumbnailUrl(post.thumbnailUrl ?? "");
    setIsPublished(post.isPublished ?? true);
    setPostReady(true);
  }, [post, user, router, slug]);

  const handleSave = async (publish?: boolean) => {
    if (!accessToken) return;
    setSaving(true);
    try {
      const updated = await updatePost(accessToken, slug, {
        title: title.trim(),
        content,
        categorySlug,
        type: postType,
        techStack: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        isPublished: publish ?? isPublished,
      });
      draft.clearDraft();
      toast.success("Post updated");
      router.push(`/post/${updated.slug}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !post) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <RequireAuth>
      <main className="container mx-auto px-4 max-w-5xl py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/post/${slug}`}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold">Edit post</h1>
              {draft.dirty && (
                <p className="text-xs text-muted-foreground mt-1">
                  {draft.lastSaved
                    ? `Autosaved ${new Date(draft.lastSaved).toLocaleTimeString()}`
                    : "Unsaved changes"}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" disabled={saving} onClick={() => void handleSave(false)}>
              Save draft
            </Button>
            <Button className="rounded-full gap-2" disabled={saving} onClick={() => void handleSave(true)}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Publish
            </Button>
          </div>
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-3xl font-bold border-none shadow-none mb-6"
          placeholder="Title"
        />

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label>Category</Label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="mt-1 flex h-11 w-full rounded-xl border px-3 text-sm"
            >
              {categories?.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Type</Label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
              className="mt-1 flex h-11 w-full rounded-xl border px-3 text-sm"
            >
              {POST_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          placeholder="Tags, comma separated"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="mb-4 rounded-xl"
        />
        {accessToken && (
          <ImageUpload
            token={accessToken}
            folder="thumbnails"
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            label="Cover image"
            className="mb-8"
          />
        )}

        <Editor initialContent={content} onChange={setContent} />
      </main>
    </RequireAuth>
  );
}
