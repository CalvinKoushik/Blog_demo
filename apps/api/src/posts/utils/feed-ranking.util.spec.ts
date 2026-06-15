import { scorePost, sortByRank } from './feed-ranking.util';

describe('feed-ranking.util', () => {
  const baseDate = new Date();

  const createPost = (
    id: string,
    likes: number,
    comments: number,
    viewCount: number,
    hoursOld: number,
    categoryId: string = 'cat-1'
  ) => {
    return {
      id,
      categoryId,
      createdAt: new Date(baseDate.getTime() - hoursOld * 60 * 60 * 1000),
      viewCount,
      _count: { likes, comments },
    };
  };

  describe('scorePost', () => {
    it('gives higher score to posts with more likes and comments', () => {
      const lowEngagement = createPost('p1', 1, 0, 10, 0);
      const highEngagement = createPost('p2', 10, 5, 100, 0);

      const score1 = scorePost(lowEngagement);
      const score2 = scorePost(highEngagement);

      expect(score2).toBeGreaterThan(score1);
    });

    it('decays score as post gets older (recency bias)', () => {
      const newPost = createPost('p1', 10, 5, 100, 1);
      const oldPost = createPost('p2', 10, 5, 100, 48);

      const scoreNew = scorePost(newPost);
      const scoreOld = scorePost(oldPost);

      expect(scoreNew).toBeGreaterThan(scoreOld);
    });

    it('boosts score if post category is in preferred categories', () => {
      const post = createPost('p1', 10, 5, 100, 1, 'preferred-cat');
      
      const unboosted = scorePost(post, new Set(['other-cat']));
      const boosted = scorePost(post, new Set(['preferred-cat']));

      expect(boosted).toBeCloseTo(unboosted * 1.2);
      expect(boosted).toBeGreaterThan(unboosted);
    });

    it('calculates score using the exact formula (engagement + 1) * recency * categoryBoost', () => {
      const post = createPost('p1', 2, 1, 50, 36, 'cat');
      // likes(2)*3 + comments(1)*5 + views(50)*0.08 = 6 + 5 + 4 = 15
      // recency = 1 / (1 + 36/36) = 1 / 2 = 0.5
      // boost = 1 (no preferred)
      // score = (15 + 1) * 0.5 * 1 = 16 * 0.5 = 8

      const score = scorePost(post);
      expect(score).toBeCloseTo(8);
    });
  });

  describe('sortByRank', () => {
    it('sorts posts by rankScore in descending order', () => {
      const p1 = createPost('p1', 1, 0, 0, 0); // low engagement
      const p2 = createPost('p2', 50, 10, 500, 0); // high engagement
      const p3 = createPost('p3', 10, 2, 100, 0); // medium engagement

      const sorted = sortByRank([p1, p2, p3]);

      expect(sorted[0].id).toBe('p2');
      expect(sorted[1].id).toBe('p3');
      expect(sorted[2].id).toBe('p1');
    });

    it('falls back to createdAt sorting if rankScores are exactly identical', () => {
      const p1 = createPost('p1', 10, 0, 0, 2);
      const p2 = createPost('p2', 10, 0, 0, 1);

      // p1 is older than p2, so p1 has slightly lower score.
      // We need to construct posts with identical scores by enforcing the same date.
      const identical1 = { ...createPost('i1', 10, 0, 0, 1), createdAt: baseDate };
      const identical2 = { ...createPost('i2', 10, 0, 0, 1), createdAt: new Date(baseDate.getTime() + 1000) };

      const sorted = sortByRank([identical1, identical2]);
      
      // identical2 is newer, so it should come first if scores are same.
      expect(sorted[0].id).toBe('i2');
      expect(sorted[1].id).toBe('i1');
    });

    it('applies category boost correctly when sorting', () => {
      // Two identical posts, but one is in a preferred category
      const p1 = createPost('p1', 10, 5, 100, 1, 'cat-1');
      const p2 = createPost('p2', 10, 5, 100, 1, 'cat-2');

      const preferred = new Set(['cat-2']);
      const sorted = sortByRank([p1, p2], preferred);

      // p2 gets a 1.2x boost, so it should be first
      expect(sorted[0].id).toBe('p2');
      expect(sorted[1].id).toBe('p1');
    });
  });
});
