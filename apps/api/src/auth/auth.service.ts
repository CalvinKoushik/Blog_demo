import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const profileSelect = {
  firstName: true,
  lastName: true,
  nickname: true,
  avatarUrl: true,
  collegeName: true,
  department: true,
  year: true,
  bio: true,
  skills: true,
  linkedinUrl: true,
  githubUrl: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private email: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const nickname = dto.nickname.toLowerCase().trim();

    const [emailTaken, nicknameTaken] = await Promise.all([
      this.prisma.user.findUnique({ where: { email }, select: { id: true } }),
      this.prisma.profile.findUnique({ where: { nickname }, select: { id: true } }),
    ]);

    if (emailTaken) {
      throw new ConflictException('An account with this email already exists');
    }
    if (nicknameTaken) {
      throw new ConflictException('This username is already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const skills = (dto.skills ?? []).map((s) => s.trim()).filter(Boolean);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.STUDENT,
        isVerified: false,
        profile: {
          create: {
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            nickname,
            collegeName: dto.collegeName.trim(),
            department: dto.department.trim(),
            year: dto.year,
            linkedinUrl: dto.linkedinUrl.trim(),
            githubUrl: dto.githubUrl?.trim() || null,
            bio: dto.bio?.trim() || null,
            skills,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        profile: { select: profileSelect },
      },
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        passwordHash: true,
        profile: { select: profileSelect },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { passwordHash: _, ...safeUser } = user;
    return this.issueTokens(safeUser);
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        refreshToken: true,
        profile: { select: profileSelect },
      },
    });

    if (!user?.refreshToken) {
      throw new UnauthorizedException('Session expired. Please sign in again.');
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!matches) {
      throw new UnauthorizedException('Session expired. Please sign in again.');
    }

    const { refreshToken: _, ...safeUser } = user;
    return this.issueTokens(safeUser);
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  private async issueTokens(user: {
    id: string;
    email: string;
    role: Role;
    profile: {
      firstName: string;
      lastName: string;
      nickname: string | null;
      avatarUrl: string | null;
      collegeName: string | null;
      department: string | null;
      year: number | null;
      bio?: string | null;
      skills?: string[];
      linkedinUrl?: string | null;
      githubUrl?: string | null;
    } | null;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret:
          this.config.get<string>('JWT_ACCESS_SECRET') ??
          this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES', '7d'),
      }),
    ]);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshTokenHash },
    });

    return {
      accessToken,
      refreshToken,
      user: this.toAuthUser(user),
    };
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    role: Role;
    profile: {
      firstName: string;
      lastName: string;
      nickname: string | null;
      avatarUrl: string | null;
      collegeName: string | null;
      department: string | null;
      year: number | null;
    } | null;
  }) {
    const profile = user.profile;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      username: profile?.nickname ?? '',
      avatarUrl: profile?.avatarUrl ?? null,
      collegeName: profile?.collegeName ?? null,
      department: profile?.department ?? null,
      year: profile?.year ?? null,
    };
  }

  async verifyEmail(token: string) {
    let payload;
    try {
      payload = await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { 
        id: true, 
        email: true,
        isVerified: true,
        profile: { select: { firstName: true } },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      return { message: 'Email already verified' };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    await this.email.sendWelcomeEmail(
      user.email,
      user.profile?.firstName || 'Student',
    );

    return { message: 'Email verified successfully' };
  }

  async sendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, isVerified: true, profile: { select: { firstName: true } } },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      return { message: 'Email already verified' };
    }

    const token = this.jwt.sign(
      { sub: user.id },
      {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: '24h',
      },
    );

    await this.email.sendVerificationEmail(
      user.email,
      token,
      user.profile?.firstName || 'Student',
    );

    return { message: 'Verification email sent' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, profile: { select: { firstName: true } } },
    });

    if (!user) {
      // Don't reveal if email exists (security)
      return { message: 'If this email exists, you will receive a password reset link' };
    }

    const token = this.jwt.sign(
      { sub: user.id, type: 'reset' },
      {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: '1h',
      },
    );

    await this.email.sendPasswordResetEmail(
      user.email,
      token,
      user.profile?.firstName || 'Student',
    );

    return { message: 'If this email exists, you will receive a password reset link' };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload;
    try {
      payload = await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (payload.type !== 'reset') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { message: 'Password reset successfully' };
  }
}
