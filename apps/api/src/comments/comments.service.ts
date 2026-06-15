import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { activeCommentWhere } from '../common/constants/post-includes';
import { NotificationsService } from '../common/notifications/notifications.service';
import { SanitizeService } from '../common/sanitize.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

const commentAuthorSelect = {
  profile: {
    select: {
      firstName: true,
      lastName: true,
      nickname: true,
      avatarUrl: true,
    },
  },
} as const;

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sanitize: SanitizeService,
    private readonly notifications: NotificationsService,
  ) {}

  async listByPostSlug(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, deletedAt: null, isPublished: true },
      select: { id: true },
    });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.comment.findMany({
      where: { postId: post.id, parentId: null, ...activeCommentWhere },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        author: { select: commentAuthorSelect },
        replies: {
          where: activeCommentWhere,
          orderBy: { createdAt: 'asc' },
          take: 20,
          include: { author: { select: commentAuthorSelect } },
        },
      },
    });
  }

  async create(
    slug: string,
    userId: string | null,
    dto: CreateCommentDto,
  ) {
    const post = await this.prisma.post.findFirst({
      where: { slug, deletedAt: null, isPublished: true },
      select: { id: true, authorId: true },
    });
    if (!post) throw new NotFoundException('Post not found');

    if (!userId && !dto.guestName?.trim()) {
      throw new ForbiddenException('Sign in or provide a display name');
    }

    if (dto.parentId) {
      const parent = await this.prisma.comment.findFirst({
        where: { id: dto.parentId, postId: post.id, ...activeCommentWhere },
      });
      if (!parent) throw new NotFoundException('Parent comment not found');
    }

    const content = this.sanitize.sanitizeHtml(dto.content);

    const comment = await this.prisma.comment.create({
      data: {
        content,
        postId: post.id,
        authorId: userId,
        guestName: userId ? null : dto.guestName?.trim() ?? null,
        parentId: dto.parentId ?? null,
      },
      include: {
        author: { select: commentAuthorSelect },
        replies: {
          where: activeCommentWhere,
          include: { author: { select: commentAuthorSelect } },
        },
      },
    });

    if (userId && post.authorId !== userId) {
      await this.notifications.enqueue({
        userId: post.authorId,
        actorId: userId,
        type: NotificationType.COMMENT,
        entityId: comment.id,
      });
    }

    return comment;
  }

  async softDelete(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, ...activeCommentWhere },
      select: { id: true, authorId: true },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Comment removed' };
  }
}
