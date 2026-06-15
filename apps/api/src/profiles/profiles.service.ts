import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getByUsername(username: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { nickname: username.toLowerCase() },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nickname: true,
        bio: true,
        avatarUrl: true,
        collegeName: true,
        department: true,
        year: true,
        skills: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        resumeUrl: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Get follower/following counts
    const [followerCount, followingCount, postsCount] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: profile.userId } }),
      this.prisma.follow.count({ where: { followerId: profile.userId } }),
      this.prisma.post.count({ 
        where: { 
          authorId: profile.userId,
          isPublished: true,
          deletedAt: null,
        } 
      }),
    ]);

    return {
      ...profile,
      followersCount: followerCount,
      followingCount,
      postsCount,
    };
  }

  async getById(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nickname: true,
        bio: true,
        avatarUrl: true,
        collegeName: true,
        department: true,
        year: true,
        skills: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        resumeUrl: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const [followerCount, followingCount, postsCount] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
      this.prisma.post.count({ 
        where: { 
          authorId: userId,
          isPublished: true,
          deletedAt: null,
        } 
      }),
    ]);

    return {
      ...profile,
      followersCount: followerCount,
      followingCount,
      postsCount,
    };
  }

  async update(userId: string, data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    collegeName?: string;
    department?: string;
    year?: number;
    skills?: string[];
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    avatarUrl?: string;
  }) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const updated = await this.prisma.profile.update({
      where: { userId },
      data: {
        firstName: data.firstName ?? profile.firstName,
        lastName: data.lastName ?? profile.lastName,
        bio: data.bio ?? profile.bio,
        collegeName: data.collegeName ?? profile.collegeName,
        department: data.department ?? profile.department,
        year: data.year ?? profile.year,
        skills: data.skills ?? profile.skills,
        linkedinUrl: data.linkedinUrl ?? profile.linkedinUrl,
        githubUrl: data.githubUrl ?? profile.githubUrl,
        portfolioUrl: data.portfolioUrl ?? profile.portfolioUrl,
        avatarUrl: data.avatarUrl ?? profile.avatarUrl,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nickname: true,
        bio: true,
        avatarUrl: true,
        collegeName: true,
        department: true,
        year: true,
        skills: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        resumeUrl: true,
      },
    });

    return updated;
  }

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ConflictException('Cannot follow yourself');
    }

    const [follower, following] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: followerId } }),
      this.prisma.user.findUnique({ where: { id: followingId } }),
    ]);

    if (!follower || !following) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });
    } catch {
      throw new ConflictException('Already following this user');
    }

    const followerCount = await this.prisma.follow.count({
      where: { followingId },
    });

    return { message: 'Followed successfully', followers: followerCount };
  }

  async unfollow(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!follow) {
      throw new NotFoundException('Not following this user');
    }

    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    const followerCount = await this.prisma.follow.count({
      where: { followingId },
    });

    return { message: 'Unfollowed successfully', followers: followerCount };
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  nickname: true,
                  avatarUrl: true,
                  bio: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({ where: { followingId: userId } }),
    ]);

    return {
      data: followers.map((f) => ({
        id: f.follower.id,
        ...f.follower.profile,
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  nickname: true,
                  avatarUrl: true,
                  bio: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return {
      data: following.map((f) => ({
        id: f.following.id,
        ...f.following.profile,
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getTrendingStudents(limit: number = 10) {
    const profiles = await this.prisma.profile.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nickname: true,
        avatarUrl: true,
        bio: true,
        userId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const withCounts = await Promise.all(
      profiles.map(async (p) => {
        const followerCount = await this.prisma.follow.count({
          where: { followingId: p.userId },
        });
        return { ...p, followersCount: followerCount };
      }),
    );

    return withCounts;
  }

  async searchProfiles(query: string, limit: number = 10) {
    const profiles = await this.prisma.profile.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { nickname: { contains: query, mode: 'insensitive' } },
          { collegeName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nickname: true,
        avatarUrl: true,
        collegeName: true,
        userId: true,
      },
      take: limit,
    });

    return profiles;
  }
}
