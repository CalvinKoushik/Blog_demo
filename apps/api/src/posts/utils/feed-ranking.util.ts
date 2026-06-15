type RankablePost = {
  id: string;
  categoryId: string;
  createdAt: Date;
  viewCount: number;
  _count: { likes: number; comments: number };
};

/** Engagement + recency + optional category affinity boost. */
export function scorePost(
  post: RankablePost,
  preferredCategoryIds?: Set<string>,
): number {
  const hours =
    (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
  const recency = 1 / (1 + hours / 36);
  const engagement =
    post._count.likes * 3 +
    post._count.comments * 5 +
    post.viewCount * 0.08;
  const categoryBoost =
    preferredCategoryIds?.has(post.categoryId) ? 1.2 : 1;
  return (engagement + 1) * recency * categoryBoost;
}

export function sortByRank<T extends RankablePost>(
  posts: T[],
  preferredCategoryIds?: Set<string>,
): (T & { rankScore: number })[] {
  return posts
    .map((p) => ({
      ...p,
      rankScore: scorePost(p, preferredCategoryIds),
    }))
    .sort((a, b) => {
      if (b.rankScore !== a.rankScore) return b.rankScore - a.rankScore;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
}
