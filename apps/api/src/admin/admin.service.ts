import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { RemovePostDto } from './dto/remove-post.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // USER MANAGEMENT
  async listUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          isSuspended: true,
          createdAt: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              nickname: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isSuspended: true,
        suspendedAt: true,
        suspendedReason: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        _count: {
          select: { posts: true, followers: true, following: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async suspendUser(userId: string, adminId: string, dto: SuspendUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === adminId) {
      throw new BadRequestException('Cannot suspend yourself');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: true,
        suspendedAt: new Date(),
        suspendedReason: dto.reason,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'suspend_user',
        entityType: 'user',
        entityId: userId,
        changes: JSON.stringify({
          isSuspended: false,
          suspendedAt: null,
          suspendedReason: null,
        }),
      },
    });

    return { success: true, message: 'User suspended successfully' };
  }

  async unsuspendUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: false,
        suspendedAt: null,
        suspendedReason: null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'unsuspend_user',
        entityType: 'user',
        entityId: userId,
      },
    });

    return { success: true, message: 'User unsuspended successfully' };
  }

  async deleteUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === adminId) {
      throw new BadRequestException('Cannot delete yourself');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'delete_user',
        entityType: 'user',
        entityId: userId,
      },
    });

    return { success: true, message: 'User deleted successfully' };
  }

  // ANALYTICS
  async getOverviewStats() {
    const [totalUsers, totalPosts, totalComments, activeUsers, suspendedUsers] =
      await Promise.all([
        this.prisma.user.count({ where: { isSuspended: false } }),
        this.prisma.post.count({ where: { isPublished: true, isRemoved: false } }),
        this.prisma.comment.count(),
        this.prisma.user.count({
          where: {
            isSuspended: false,
            posts: { some: {} },
          },
        }),
        this.prisma.user.count({ where: { isSuspended: true } }),
      ]);

    return {
      totalUsers,
      totalPosts,
      totalComments,
      activeUsers,
      suspendedUsers,
      updatedAt: new Date(),
    };
  }

  // AUDIT LOGS
  async getAuditLogs(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        include: {
          admin: {
            select: {
              email: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  // POST MANAGEMENT
  async removePost(postId: string, adminId: string, dto: RemovePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.prisma.post.update({
      where: { id: postId },
      data: {
        isRemoved: true,
        removedAt: new Date(),
        removedReason: dto.reason,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'remove_post',
        entityType: 'post',
        entityId: postId,
        changes: JSON.stringify(dto),
      },
    });

    return { success: true, message: 'Post removed successfully' };
  }

  async restorePost(postId: string, adminId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.prisma.post.update({
      where: { id: postId },
      data: {
        isRemoved: false,
        removedAt: null,
        removedReason: null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'restore_post',
        entityType: 'post',
        entityId: postId,
      },
    });

    return { success: true, message: 'Post restored successfully' };
  }
}
