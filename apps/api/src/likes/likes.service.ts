import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { activePostWhere } from '../common/constants/post-includes';
import { NotificationsService } from '../common/notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private async findPublishedPost(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, ...activePostWhere },
      select: { id: true, authorId: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async like(slug: string, userId: string) {
    const post = await this.findPublishedPost(slug);
    try {
      await this.prisma.like.create({
        data: { userId, postId: post.id },
      });
    } catch {
      throw new ConflictException('Already liked');
    }

    if (post.authorId !== userId) {
      await this.notifications.enqueue({
        userId: post.authorId,
        actorId: userId,
        type: NotificationType.LIKE,
        entityId: post.id,
      });
    }

    return this.counts(slug, userId);
  }

  async unlike(slug: string, userId: string) {
    const post = await this.findPublishedPost(slug);
    const deleted = await this.prisma.like.deleteMany({
      where: { userId, postId: post.id },
    });
    if (!deleted.count) throw new NotFoundException('Like not found');
    return this.counts(slug, userId);
  }

  async counts(slug: string, userId?: string) {
    const post = await this.findPublishedPost(slug);
    const [likes, likedByMe] = await Promise.all([
      this.prisma.like.count({ where: { postId: post.id } }),
      userId
        ? this.prisma.like.findUnique({
            where: { userId_postId: { userId, postId: post.id } },
          })
        : Promise.resolve(null),
    ]);
    return { likes, likedByMe: !!likedByMe };
  }
}
