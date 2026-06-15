import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PostType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { slugifyTitle, uniquePostSlug } from './utils/slug.util';
import {
  activeCommentWhere,
  activePostWhere,
  postInclude,
} from '../common/constants/post-includes';
import { SanitizeService } from '../common/sanitize.service';
import { UrlValidationService } from '../common/url-validation.service';
import {
  attachSocialState,
  PaginatedPosts,
} from './posts-social.util';
import { decodeCursor, encodeCursor } from './utils/cursor.util';
import { sortByRank } from './utils/feed-ranking.util';

type PostWithInclude = Prisma.PostGetPayload<{ include: ReturnType<typeof postInclude> }>;

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sanitize: SanitizeService,
    private readonly urls: UrlValidationService,
  ) {}

  private async preferredCategoryIds(userId?: string): Promise<Set<string>> {
    if (!userId) return new Set();
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const authorIds = following.map((f) => f.followingId);
    if (!authorIds.length) return new Set();

    const posts = await this.prisma.post.findMany({
      where: { authorId: { in: authorIds }, ...activePostWhere },
      select: { categoryId: true },
      distinct: ['categoryId'],
      take: 20,
    });
    return new Set(posts.map((p) => p.categoryId));
  }

  private paginate<T extends { id: string; createdAt: Date }>(
    items: T[],
    limit: number,
    getCursor: (item: T) => { id: string; createdAt: string; score?: number },
  ): PaginatedPosts<T> {
    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    const last = page[page.length - 1];
    return {
      items: page,
      nextCursor:
        hasMore && last
          ? encodeCursor(getCursor(last))
          : null,
    };
  }

  async getRankedFeed(
    userId: string | undefined,
    query: FeedQueryDto,
  ): Promise<PaginatedPosts<PostWithInclude & { likedByMe: boolean; bookmarkedByMe: boolean }>> {
    const limit = query.limit ?? 10;
    const cursor = decodeCursor(query.cursor);
    const preferred = await this.preferredCategoryIds(userId);

    const poolSize = Math.min(limit * 4, 80);
    const posts = await this.prisma.post.findMany({
      where: activePostWhere,
      orderBy: { createdAt: 'desc' },
      take: poolSize,
      include: postInclude(),
    });

    let ranked = sortByRank(posts, preferred);

    if (cursor?.score != null) {
      ranked = ranked.filter(
        (p) =>
          p.rankScore < cursor.score! ||
          (p.rankScore === cursor.score && p.id < cursor.id),
      );
    } else if (cursor) {
      const cAt = new Date(cursor.createdAt);
      ranked = ranked.filter(
        (p) =>
          p.createdAt < cAt ||
          (p.createdAt.getTime() === cAt.getTime() && p.id < cursor.id),
      );
    }

    const sliced = ranked.slice(0, limit + 1);
    const page = sliced.slice(0, limit);
    const last = page[page.length - 1];
    const withSocial = await attachSocialState(this.prisma, page, userId);

    return {
      items: withSocial,
      nextCursor:
        sliced.length > limit && last
          ? encodeCursor({
              id: last.id,
              createdAt: last.createdAt.toISOString(),
              score: last.rankScore,
            })
          : null,
    };
  }

  async getFollowingFeed(
    userId: string,
    query: FeedQueryDto,
  ): Promise<PaginatedPosts<PostWithInclude & { likedByMe: boolean; bookmarkedByMe: boolean }>> {
    const limit = query.limit ?? 10;
    const cursor = decodeCursor(query.cursor);

    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const authorIds = following.map((f) => f.followingId);
    if (!authorIds.length) return { items: [], nextCursor: null };

    const where: Prisma.PostWhereInput = {
      ...activePostWhere,
      authorId: { in: authorIds },
    };
    if (cursor) {
      where.OR = [
        { createdAt: { lt: new Date(cursor.createdAt) } },
        {
          createdAt: new Date(cursor.createdAt),
          id: { lt: cursor.id },
        },
      ];
    }

    const posts = await this.prisma.post.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: postInclude(),
    });

    const hasMore = posts.length > limit;
    const page = hasMore ? posts.slice(0, limit) : posts;
    const last = page[page.length - 1];
    const withSocial = await attachSocialState(this.prisma, page, userId);

    return {
      items: withSocial,
      nextCursor:
        hasMore && last
          ? encodeCursor({
              id: last.id,
              createdAt: last.createdAt.toISOString(),
            })
          : null,
    };
  }

  async searchPosts(
    query: FeedQueryDto,
    userId?: string,
  ): Promise<PaginatedPosts<PostWithInclude & { likedByMe: boolean; bookmarkedByMe: boolean }>> {
    const limit = query.limit ?? 10;
    const cursor = decodeCursor(query.cursor);
    const q = query.q?.trim();

    const where: Prisma.PostWhereInput = { ...activePostWhere };

    if (query.category) {
      where.category = { slug: query.category };
    }
    if (query.type) {
      where.type = query.type;
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
        { techStack: { has: q } },
      ];
    }
    if (cursor) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            { createdAt: { lt: new Date(cursor.createdAt) } },
            {
              createdAt: new Date(cursor.createdAt),
              id: { lt: cursor.id },
            },
          ],
        },
      ];
    }

    const posts = await this.prisma.post.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: postInclude(),
    });

    const hasMore = posts.length > limit;
    const page = hasMore ? posts.slice(0, limit) : posts;
    const last = page[page.length - 1];
    const withSocial = await attachSocialState(this.prisma, page, userId);

    return {
      items: withSocial,
      nextCursor:
        hasMore && last
          ? encodeCursor({
              id: last.id,
              createdAt: last.createdAt.toISOString(),
            })
          : null,
    };
  }

  async getMyPosts(userId: string, published?: boolean) {
    const where =
      published === undefined
        ? { authorId: userId, deletedAt: null }
        : {
            authorId: userId,
            deletedAt: null,
            isPublished: published,
          };

    const posts = await this.prisma.post.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: postInclude(),
    });
    return attachSocialState(this.prisma, posts, userId);
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
  }

  async getPostBySlug(slug: string, userId?: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, deletedAt: null },
      include: postInclude(),
    });

    if (!post || (!post.isPublished && post.authorId !== userId)) {
      throw new NotFoundException('Post not found');
    }

    if (post.isPublished) {
      await this.prisma.post.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    const [withSocial] = await attachSocialState(this.prisma, [post], userId);
    return withSocial;
  }

  async createPost(authorId: string, dto: CreatePostDto) {
    const category = await this.prisma.category.findUnique({
      where: { slug: dto.categorySlug },
    });
    if (!category) throw new BadRequestException('Invalid category');

    const baseSlug = slugifyTitle(dto.title);
    const slug = await uniquePostSlug(baseSlug, async (s) => {
      const existing = await this.prisma.post.findUnique({
        where: { slug: s },
        select: { id: true },
      });
      return !!existing;
    });

    const techStack = (dto.techStack ?? []).map((t) => t.trim()).filter(Boolean);
    const content = this.sanitize.sanitizeHtml(dto.content);
    const thumbnailUrl = this.urls.validateAssetUrl(
      dto.thumbnailUrl,
      'thumbnailUrl',
    );

    const plain = this.sanitize.stripHtml(content);
    const minLen = dto.isPublished === false ? 1 : 10;
    if (plain.length < minLen) {
      throw new BadRequestException('Post content is too short');
    }

    const post = await this.prisma.post.create({
      data: {
        title: dto.title.trim(),
        slug,
        content,
        type: dto.type,
        techStack,
        thumbnailUrl,
        isPublished: dto.isPublished ?? true,
        authorId,
        categoryId: category.id,
      },
      include: postInclude(),
    });

    const [withSocial] = await attachSocialState(this.prisma, [post], authorId);
    return withSocial;
  }

  async updatePost(slug: string, authorId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findFirst({
      where: { slug, authorId, deletedAt: null },
    });
    if (!post) throw new NotFoundException('Post not found');

    let categoryId = post.categoryId;
    if (dto.categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: dto.categorySlug },
      });
      if (!category) throw new BadRequestException('Invalid category');
      categoryId = category.id;
    }

    const data: Record<string, unknown> = { categoryId };
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.isPublished !== undefined) data.isPublished = dto.isPublished;
    if (dto.techStack !== undefined) {
      data.techStack = dto.techStack.map((t) => t.trim()).filter(Boolean);
    }
    if (dto.thumbnailUrl !== undefined) {
      data.thumbnailUrl = this.urls.validateAssetUrl(
        dto.thumbnailUrl,
        'thumbnailUrl',
      );
    }
    if (dto.content !== undefined) {
      const content = this.sanitize.sanitizeHtml(dto.content);
      if (this.sanitize.stripHtml(content).length < 10) {
        throw new BadRequestException('Post content is too short');
      }
      data.content = content;
    }

    const updated = await this.prisma.post.update({
      where: { id: post.id },
      data,
      include: postInclude(),
    });
    const [withSocial] = await attachSocialState(this.prisma, [updated], authorId);
    return withSocial;
  }

  async softDeletePost(slug: string, authorId: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true, authorId: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.update({
      where: { id: post.id },
      data: { deletedAt: new Date(), isPublished: false },
    });

    return { message: 'Post removed' };
  }
}
