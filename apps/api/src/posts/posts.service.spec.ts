import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { SanitizeService } from '../common/sanitize.service';
import { UrlValidationService } from '../common/url-validation.service';
import { prismaMock } from '../prisma/prisma-mock';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostType } from '@prisma/client';

// Mock the posts-social utility and slug utility
jest.mock('./posts-social.util', () => ({
  attachSocialState: jest.fn().mockImplementation((prisma, posts, userId) => 
    Promise.resolve(posts.map((p: any) => ({ ...p, likedByMe: false, bookmarkedByMe: false })))
  ),
}));

jest.mock('./utils/slug.util', () => ({
  slugifyTitle: jest.fn().mockReturnValue('mock-slug'),
  uniquePostSlug: jest.fn().mockImplementation((baseSlug) => Promise.resolve(`${baseSlug}-unique`)),
}));

jest.mock('./utils/feed-ranking.util', () => ({
  sortByRank: jest.fn().mockImplementation((posts) => posts),
}));

describe('PostsService', () => {
  let service: PostsService;
  let sanitizeService: SanitizeService;
  let urlValidationService: UrlValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: SanitizeService,
          useValue: {
            sanitizeHtml: jest.fn().mockImplementation((val) => val),
            stripHtml: jest.fn().mockImplementation((val) => val),
          },
        },
        {
          provide: UrlValidationService,
          useValue: {
            validateAssetUrl: jest.fn().mockImplementation((val) => val),
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    sanitizeService = module.get<SanitizeService>(SanitizeService);
    urlValidationService = module.get<UrlValidationService>(UrlValidationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockPost = {
    id: 'post-1',
    title: 'Test Post',
    slug: 'test-post-unique',
    content: 'Long enough content for validation',
    type: PostType.PROJECT,
    techStack: ['React', 'Node'],
    thumbnailUrl: null,
    isPublished: true,
    authorId: 'user-1',
    categoryId: 'cat-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    viewCount: 0,
    author: { profile: { nickname: 'testuser' } },
    category: { name: 'Tech', slug: 'tech' },
    _count: { likes: 0, comments: 0 },
  };

  describe('createPost', () => {
    const dto = {
      title: 'Test Post',
      categorySlug: 'tech',
      content: 'Long enough content for validation',
      type: PostType.PROJECT,
      isPublished: true,
    };

    it('creates a post successfully', async () => {
      prismaMock.category.findUnique.mockResolvedValue({ id: 'cat-1' } as any);
      (sanitizeService.stripHtml as jest.Mock).mockReturnValue(dto.content);
      prismaMock.post.create.mockResolvedValue(mockPost as any);

      const result = await service.createPost('user-1', dto);

      expect(prismaMock.category.findUnique).toHaveBeenCalledWith({ where: { slug: 'tech' } });
      expect(prismaMock.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Test Post',
            slug: 'mock-slug-unique',
            authorId: 'user-1',
            categoryId: 'cat-1',
          }),
        })
      );
      expect(result.id).toBe('post-1');
      expect((result as any).likedByMe).toBe(false);
    });

    it('throws BadRequestException if category is invalid', async () => {
      prismaMock.category.findUnique.mockResolvedValue(null);
      await expect(service.createPost('user-1', dto)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if content is too short', async () => {
      prismaMock.category.findUnique.mockResolvedValue({ id: 'cat-1' } as any);
      (sanitizeService.stripHtml as jest.Mock).mockReturnValue('short');

      await expect(service.createPost('user-1', dto)).rejects.toThrow(BadRequestException);
    });

    it('allows shorter content for unpublished drafts', async () => {
      prismaMock.category.findUnique.mockResolvedValue({ id: 'cat-1' } as any);
      (sanitizeService.stripHtml as jest.Mock).mockReturnValue('draft');
      prismaMock.post.create.mockResolvedValue({ ...mockPost, isPublished: false } as any);

      const result = await service.createPost('user-1', { ...dto, isPublished: false });
      expect(result.isPublished).toBe(false);
    });
  });

  describe('updatePost', () => {
    it('updates a post successfully', async () => {
      prismaMock.post.findFirst.mockResolvedValue(mockPost as any);
      prismaMock.post.update.mockResolvedValue({ ...mockPost, title: 'Updated' } as any);

      const result = await service.updatePost('test-post-unique', 'user-1', { title: 'Updated' });

      expect(prismaMock.post.findFirst).toHaveBeenCalledWith({
        where: { slug: 'test-post-unique', authorId: 'user-1', deletedAt: null },
      });
      expect(prismaMock.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'post-1' },
          data: expect.objectContaining({ title: 'Updated' }),
        })
      );
      expect(result.title).toBe('Updated');
    });

    it('throws NotFoundException if post not found', async () => {
      prismaMock.post.findFirst.mockResolvedValue(null);
      await expect(service.updatePost('wrong-slug', 'user-1', { title: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDeletePost', () => {
    it('soft deletes a post', async () => {
      prismaMock.post.findFirst.mockResolvedValue(mockPost as any);
      prismaMock.post.update.mockResolvedValue({ ...mockPost, deletedAt: new Date() } as any);

      const result = await service.softDeletePost('test-post-unique', 'user-1');

      expect(prismaMock.post.update).toHaveBeenCalledWith({
        where: { id: 'post-1' },
        data: { deletedAt: expect.any(Date), isPublished: false },
      });
      expect(result.message).toBe('Post removed');
    });

    it('throws ForbiddenException if user is not author', async () => {
      prismaMock.post.findFirst.mockResolvedValue({ ...mockPost, authorId: 'wrong-user' } as any);
      await expect(service.softDeletePost('test-post-unique', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getRankedFeed', () => {
    it('returns paginated feed', async () => {
      prismaMock.follow.findMany.mockResolvedValue([]);
      prismaMock.post.findMany.mockResolvedValue([mockPost, { ...mockPost, id: 'post-2' }] as any);

      const result = await service.getRankedFeed('user-1', { limit: 1 });

      expect(result.items.length).toBe(1);
      expect(result.nextCursor).toBeDefined();
    });
  });

  describe('searchPosts', () => {
    it('filters by query and category', async () => {
      prismaMock.post.findMany.mockResolvedValue([mockPost] as any);

      const result = await service.searchPosts({ q: 'React', category: 'tech' }, 'user-1');

      expect(prismaMock.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: { slug: 'tech' },
            OR: expect.arrayContaining([
              { title: { contains: 'React', mode: 'insensitive' } },
            ]),
          }),
        })
      );
      expect(result.items.length).toBe(1);
    });
  });
});
