import { Injectable, NotFoundException } from '@nestjs/common';
import { activeCommentWhere, activePostWhere, postInclude } from '../common/constants/post-includes';
import { UrlValidationService } from '../common/url-validation.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { decodeCursor, encodeCursor } from '../posts/utils/cursor.util';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly urls: UrlValidationService,
  ) {}

  async searchPeople(
    query: string,
    viewerId?: string,
    cursor?: string,
    limit = 12,
  ) {
    const q = query.trim();
    if (!q) return { items: [], nextCursor: null };

    const decoded = decodeCursor(cursor);
    const skillMatch = q.toLowerCase();

    const profiles = await this.prisma.profile.findMany({
      where: {
        nickname: { not: null },
        OR: [
          { nickname: { contains: q, mode: 'insensitive' } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { collegeName: { contains: q, mode: 'insensitive' } },
          { department: { contains: q, mode: 'insensitive' } },
          { bio: { contains: q, mode: 'insensitive' } },
          { skills: { has: q } },
        ],
      },
      take: limit * 3,
      include: {
        user: {
          select: {
            id: true,
            _count: {
              select: {
                posts: { where: activePostWhere },
                followers: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    let filtered = profiles.filter(
      (p) =>
        p.skills.some((s) => s.toLowerCase().includes(skillMatch)) ||
        p.nickname?.toLowerCase().includes(skillMatch) ||
        p.firstName.toLowerCase().includes(skillMatch) ||
        p.lastName.toLowerCase().includes(skillMatch) ||
        p.collegeName?.toLowerCase().includes(skillMatch) ||
        p.department?.toLowerCase().includes(skillMatch) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(skillMatch),
    );

    if (decoded) {
      const idx = filtered.findIndex((p) => p.userId === decoded.id);
      if (idx >= 0) filtered = filtered.slice(idx + 1);
    }

    const page = filtered.slice(0, limit + 1);
    const hasMore = page.length > limit;
    const items = hasMore ? page.slice(0, limit) : page;
    const last = items[items.length - 1];

    let followingSet = new Set<string>();
    if (viewerId && items.length) {
      const follows = await this.prisma.follow.findMany({
        where: {
          followerId: viewerId,
          followingId: { in: items.map((p) => p.userId) },
        },
        select: { followingId: true },
      });
      followingSet = new Set(follows.map((f) => f.followingId));
    }

    return {
      items: items.map((p) => ({
        userId: p.userId,
        firstName: p.firstName,
        lastName: p.lastName,
        username: p.nickname,
        avatarUrl: p.avatarUrl,
        bio: p.bio,
        collegeName: p.collegeName,
        department: p.department,
        skills: p.skills,
        postCount: p.user._count.posts,
        followerCount: p.user._count.followers,
        following: followingSet.has(p.userId),
      })),
      nextCursor:
        hasMore && last
          ? encodeCursor({ id: last.userId, createdAt: last.updatedAt.toISOString() })
          : null,
    };
  }

  async getUserActivity(username: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { nickname: username },
      select: { userId: true },
    });
    if (!profile) throw new NotFoundException('User profile not found');

    const userId = profile.userId;

    const [recentPosts, recentComments, likedPosts] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: userId, ...activePostWhere },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: postInclude(),
      }),
      this.prisma.comment.findMany({
        where: { authorId: userId, ...activeCommentWhere },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          post: {
            select: { id: true, title: true, slug: true },
          },
        },
      }),
      this.prisma.like.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: {
          post: { include: postInclude() },
        },
      }),
    ]);

    const timeline = [
      ...recentPosts.map((p) => ({
        type: 'post' as const,
        id: p.id,
        createdAt: p.createdAt,
        post: p,
      })),
      ...recentComments.map((c) => ({
        type: 'comment' as const,
        id: c.id,
        createdAt: c.createdAt,
        comment: c,
        post: c.post,
      })),
      ...likedPosts
        .filter((l) => l.post && l.post.deletedAt === null && l.post.isPublished)
        .map((l) => ({
          type: 'like' as const,
          id: l.id,
          createdAt: l.createdAt,
          post: l.post!,
        })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 15);

    return {
      recentPosts,
      recentComments,
      likedPosts: likedPosts
        .filter((l) => l.post && l.post.deletedAt === null && l.post.isPublished)
        .map((l) => l.post),
      timeline,
    };
  }

  async getUserProfileByUsername(username: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { nickname: username },
      include: {
        user: {
          select: {
            id: true,
            posts: {
              where: activePostWhere,
              orderBy: { createdAt: 'desc' },
              include: postInclude(),
            },
            _count: {
              select: { followers: true, following: true, posts: true },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return profile;
  }

  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const data: Record<string, unknown> = {};

    if (dto.firstName !== undefined) data.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) data.lastName = dto.lastName.trim();
    if (dto.bio !== undefined) data.bio = dto.bio.trim() || null;
    if (dto.collegeName !== undefined) data.collegeName = dto.collegeName.trim();
    if (dto.department !== undefined) data.department = dto.department.trim();
    if (dto.year !== undefined) data.year = dto.year;
    if (dto.skills !== undefined) {
      data.skills = dto.skills.map((s) => s.trim()).filter(Boolean);
    }
    if (dto.linkedinUrl !== undefined) data.linkedinUrl = dto.linkedinUrl.trim();
    if (dto.githubUrl !== undefined) {
      data.githubUrl = this.urls.validateAssetUrl(dto.githubUrl, 'githubUrl');
    }
    if (dto.portfolioUrl !== undefined) {
      data.portfolioUrl = this.urls.validateAssetUrl(
        dto.portfolioUrl,
        'portfolioUrl',
      );
    }
    if (dto.resumeUrl !== undefined) {
      data.resumeUrl = this.urls.validateAssetUrl(dto.resumeUrl, 'resumeUrl');
    }
    if (dto.avatarUrl !== undefined) {
      data.avatarUrl = this.urls.validateAssetUrl(dto.avatarUrl, 'avatarUrl');
    }

    return this.prisma.profile.update({
      where: { userId },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
