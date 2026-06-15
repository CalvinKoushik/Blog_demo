import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { prismaMock } from '../../prisma/prisma-mock';
import { NotificationType } from '@prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('enqueue', () => {
    it('creates a notification if actor is not the user', async () => {
      await service.enqueue({
        userId: 'user-1',
        actorId: 'actor-1',
        type: NotificationType.LIKE,
        entityId: 'post-1',
      });

      expect(prismaMock.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          actorId: 'actor-1',
          type: NotificationType.LIKE,
          entityId: 'post-1',
        },
      });
    });

    it('does not create a notification if actor is the same as user', async () => {
      await service.enqueue({
        userId: 'user-1',
        actorId: 'user-1',
        type: NotificationType.LIKE,
        entityId: 'post-1',
      });

      expect(prismaMock.notification.create).not.toHaveBeenCalled();
    });
  });

  describe('listForUser', () => {
    it('returns a list of notifications', async () => {
      const mockNotifications = [{ id: 'notif-1' }];
      prismaMock.notification.findMany.mockResolvedValue(mockNotifications as any);

      const result = await service.listForUser('user-1', 10);
      expect(prismaMock.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('unreadCount', () => {
    it('returns the count of unread notifications', async () => {
      prismaMock.notification.count.mockResolvedValue(5);

      const result = await service.unreadCount('user-1');
      expect(prismaMock.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
      });
      expect(result).toBe(5);
    });
  });

  describe('markRead', () => {
    it('marks a specific notification as read', async () => {
      await service.markRead('user-1', 'notif-1');

      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: 'user-1' },
        data: { isRead: true },
      });
    });
  });

  describe('markAllRead', () => {
    it('marks all unread notifications as read', async () => {
      await service.markAllRead('user-1');

      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
        data: { isRead: true },
      });
    });
  });
});
