import type { ApiPost, FeedPostCard } from "@/types/post";

function estimateReadTime(content: string): string {
  const text = content.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function stripHtml(html: string, maxLen = 150): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}...`;
}

export function mapPostToCard(p: ApiPost): FeedPostCard {
  const profile = p.author.profile;
  const name = profile
    ? `${profile.firstName} ${profile.lastName}`
    : "Unknown";
  const role = profile?.collegeName
    ? `${profile.department ?? "Student"} @ ${profile.collegeName}`
    : "Student";

  return {
    id: p.id,
    title: p.title,
    excerpt: stripHtml(p.content),
    slug: p.slug,
    author: {
      name,
      username: profile?.nickname ?? "user",
      avatar: profile?.avatarUrl ?? null,
      role,
    },
    tags: p.techStack?.length ? p.techStack : p.category ? [p.category.name] : [],
    category: p.category?.name ?? p.type,
    likes: p._count?.likes ?? 0,
    comments: p._count?.comments ?? 0,
    likedByMe: p.likedByMe ?? false,
    bookmarkedByMe: p.bookmarkedByMe ?? false,
    timeAgo: new Date(p.createdAt).toLocaleDateString(),
    readTime: estimateReadTime(p.content),
    thumbnail: p.thumbnailUrl,
  };
}
