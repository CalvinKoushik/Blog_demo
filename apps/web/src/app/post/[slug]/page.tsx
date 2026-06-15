import { PostDetailClient } from "./PostDetailClient";
import { buildMetadata } from "@/lib/seo";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const res = await fetch(`${API}/posts/${slug}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) {
      return buildMetadata({
        title: "Post",
        description: "Read this post on StudentHub.",
        path: `/post/${slug}`,
      });
    }
    const post = await res.json();
    const plain = String(post.content ?? "").replace(/<[^>]+>/g, " ").trim();
    return buildMetadata({
      title: post.title,
      description: plain.slice(0, 160) || "Student community post",
      path: `/post/${slug}`,
      image: post.thumbnailUrl,
    });
  } catch {
    return buildMetadata({
      title: "Post",
      description: "Read this post on StudentHub.",
      path: `/post/${slug}`,
    });
  }
}

export default function PostDetailsPage() {
  return <PostDetailClient />;
}
