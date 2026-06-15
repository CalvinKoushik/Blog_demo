import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { activePostWhere } from '../common/constants/post-includes';

@Injectable()
export class DiscoverService {
  constructor(private readonly prisma: PrismaService) {}

  async trendingCategories(limit = 6) {
    const categories = await this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            posts: { where: activePostWhere },
          },
        },
      },
    });
    return categories
      .filter((c) => c._count.posts > 0)
      .sort((a, b) => b._count.posts - a._count.posts)
      .slice(0, limit)
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        postCount: c._count.posts,
      }));
  }

  async trendingTags(limit = 10) {
    const posts = await this.prisma.post.findMany({
      where: activePostWhere,
      select: { techStack: true },
      take: 200,
    });
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.techStack) {
        const key = tag.trim();
        if (!key) continue;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  async suggestedCreators(viewerId?: string, limit = 5) {
    const followingIds = viewerId
      ? (
          await this.prisma.follow.findMany({
            where: { followerId: viewerId },
            select: { followingId: true },
          })
        ).map((f) => f.followingId)
      : [];

    const viewerProfile = viewerId
      ? await this.prisma.profile.findUnique({
          where: { userId: viewerId },
          select: { collegeName: true, department: true, skills: true },
        })
      : null;

    const excludeIds = viewerId ? [...followingIds, viewerId] : followingIds;
    const profiles = await this.prisma.profile.findMany({
      where: {
        nickname: { not: null },
        ...(excludeIds.length ? { userId: { notIn: excludeIds } } : {}),
      },
      take: 50,
      include: {
        user: {
          select: {
            _count: {
              select: {
                posts: { where: activePostWhere },
                followers: true,
              },
            },
          },
        },
      },
    });

    const score = (p: (typeof profiles)[0]) => {
      let s =
        p.user._count.followers * 2 +
        p.user._count.posts * 3;
      if (viewerProfile) {
        if (
          viewerProfile.collegeName &&
          p.collegeName === viewerProfile.collegeName
        ) {
          s += 8;
        }
        if (
          viewerProfile.department &&
          p.department === viewerProfile.department
        ) {
          s += 5;
        }
        const sharedSkills = p.skills.filter((sk) =>
          viewerProfile.skills.some(
            (v) => v.toLowerCase() === sk.toLowerCase(),
          ),
        );
        s += sharedSkills.length * 4;
      }
      return s;
    };

    return profiles
      .filter((p) => p.user._count.posts > 0)
      .sort((a, b) => score(b) - score(a))
      .slice(0, limit)
      .map((p) => ({
        userId: p.userId,
        firstName: p.firstName,
        lastName: p.lastName,
        username: p.nickname,
        avatarUrl: p.avatarUrl,
        collegeName: p.collegeName,
        department: p.department,
        skills: p.skills.slice(0, 4),
        postCount: p.user._count.posts,
        followerCount: p.user._count.followers,
      }));
  }
}
