import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaMock } from '../prisma/prisma-mock';
import { Role } from '@prisma/client';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
            getOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    // Default config mocks
    (configService.getOrThrow as jest.Mock).mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'secret';
      if (key === 'JWT_REFRESH_SECRET') return 'refresh_secret';
      return key;
    });
    (configService.get as jest.Mock).mockImplementation((key: string, def: any) => def);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: Role.STUDENT,
    passwordHash: 'hashed-password',
    refreshToken: 'hashed-refresh-token',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      firstName: 'Test',
      lastName: 'User',
      nickname: 'testuser',
      avatarUrl: null,
      collegeName: 'MIT',
      department: 'CS',
      year: 1,
      bio: null,
      skills: [],
      linkedinUrl: null,
      githubUrl: null,
    },
  };

  describe('login', () => {
    it('returns tokens when credentials are valid', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-refresh-hash');
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: 'test@example.com' } })
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: expect.objectContaining({
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
        }),
      });
    });

    it('throws unauthorized error on invalid password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws unauthorized error on invalid email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'notfound@example.com', password: 'password123' })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      nickname: 'newuser',
      collegeName: 'Stanford',
      department: 'CS',
      year: 1,
      linkedinUrl: 'https://linkedin.com/in/newuser',
    };

    it('hashes password and creates user correctly', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.profile.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce('hashed-password') // for password
        .mockResolvedValueOnce('hashed-refresh-token'); // for refresh token
      
      prismaMock.user.create.mockResolvedValue({
        id: 'user-2',
        email: registerDto.email,
        role: Role.STUDENT,
        profile: {
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          nickname: registerDto.nickname,
          collegeName: registerDto.collegeName,
          department: registerDto.department,
          year: registerDto.year,
        },
      } as any);

      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await authService.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaMock.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: registerDto.email,
            passwordHash: 'hashed-password',
            profile: expect.any(Object),
          }),
        })
      );
      expect(result.accessToken).toBe('access-token');
      expect(result.user.username).toBe('newuser');
    });

    it('throws conflict error if email is taken', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing' } as any);
      prismaMock.profile.findUnique.mockResolvedValue(null);

      await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('throws conflict error if nickname is taken', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.profile.findUnique.mockResolvedValue({ id: 'existing' } as any);

      await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('refresh', () => {
    it('returns new tokens when refresh token is valid', async () => {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'user-1' });
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('new-access')
        .mockResolvedValueOnce('new-refresh');

      const result = await authService.refresh('valid-refresh-token');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-refresh-token', expect.any(Object));
      expect(bcrypt.compare).toHaveBeenCalledWith('valid-refresh-token', 'hashed-refresh-token');
      expect(result.accessToken).toBe('new-access');
    });

    it('throws unauthorized error when JWT verification fails', async () => {
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      await expect(authService.refresh('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws unauthorized error when refresh token does not match DB', async () => {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'user-1' });
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.refresh('old-refresh-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
