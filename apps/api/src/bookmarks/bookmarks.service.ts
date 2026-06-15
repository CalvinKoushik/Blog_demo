import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { activePostWhere } from '../common/constants/post-includes';
import { postInclude } from '../common/constants/post-includes';
import { attachSocialState } from '../posts/posts-social.util';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  private async findPublishedPost(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, ...activePostWhere },
      select: { id: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async bookmark(slug: string, userId: string) {
    const post = await this.findPublishedPost(slug);
    try {
      await this.prisma.bookmark.create({
        data: { userId, postId: post.id },
      });
    } catch {
      throw new ConflictException('Already saved');
    }
    return { bookmarked: true };
  }

  async unbookmark(slug: string, userId: string) {
    const post = await this.findPublishedPost(slug);
    const removed = await this.prisma.bookmark.deleteMany({
      where: { userId, postId: post.id },
    });
    if (!removed.count) throw new NotFoundException('Bookmark not found');
    return { bookmarked: false };
  }

  async status(slug: string, userId?: string) {
    const post = await this.findPublishedPost(slug);
    if (!userId) return { bookmarked: false };
    const row = await this.prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId: post.id } },
    });
    return { bookmarked: !!row };
  }

  async listSaved(userId: string, limit = 30) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        post: {
          include: postInclude(),
        },
      },
    });
    const posts = bookmarks
      .map((b) => b.post)
      .filter((p) => p && p.deletedAt === null && p.isPublished);
    return attachSocialState(this.prisma, posts, userId);
  }
}
