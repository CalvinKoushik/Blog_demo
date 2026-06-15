import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationsService } from '../common/notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private async resolveProfile(username: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { nickname: username },
      select: { userId: true },
    });
    if (!profile) throw new NotFoundException('User not found');
    return profile;
  }

  async follow(followerId: string, username: string) {
    const target = await this.resolveProfile(username);
    if (target.userId === followerId) {
      throw new ConflictException('Cannot follow yourself');
    }
    try {
      await this.prisma.follow.create({
        data: { followerId, followingId: target.userId },
      });
    } catch {
      throw new ConflictException('Already following');
    }

    await this.notifications.enqueue({
      userId: target.userId,
      actorId: followerId,
      type: NotificationType.FOLLOW,
      entityId: followerId,
    });

    return { following: true };
  }

  async unfollow(followerId: string, username: string) {
    const target = await this.resolveProfile(username);
    const removed = await this.prisma.follow.deleteMany({
      where: { followerId, followingId: target.userId },
    });
    if (!removed.count) throw new NotFoundException('Not following');
    return { following: false };
  }

  async status(viewerId: string | undefined, username: string) {
    const target = await this.resolveProfile(username);
    if (!viewerId) return { following: false };
    const row = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: viewerId,
          followingId: target.userId,
        },
      },
    });
    return { following: !!row };
  }
}
