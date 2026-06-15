import { PrismaService } from '../prisma/prisma.service';

export async function attachSocialState<T extends { id: string }>(
  prisma: PrismaService,
  posts: T[],
  userId?: string,
): Promise<(T & { likedByMe: boolean; bookmarkedByMe: boolean })[]> {
  if (!userId || !posts.length) {
    return posts.map((p) => ({
      ...p,
      likedByMe: false,
      bookmarkedByMe: false,
    }));
  }
  const ids = posts.map((p) => p.id);
  const [likes, bookmarks] = await Promise.all([
    prisma.like.findMany({
      where: { userId, postId: { in: ids } },
      select: { postId: true },
    }),
    prisma.bookmark.findMany({
      where: { userId, postId: { in: ids } },
      select: { postId: true },
    }),
  ]);
  const liked = new Set(likes.map((l) => l.postId));
  const bookmarked = new Set(bookmarks.map((b) => b.postId));
  return posts.map((p) => ({
    ...p,
    likedByMe: liked.has(p.id),
    bookmarkedByMe: bookmarked.has(p.id),
  }));
}

export interface PaginatedPosts<T> {
  items: T[];
  nextCursor: string | null;
}
