import { NotificationType } from '@prisma/client';

/** Payload for future BullMQ / Redis workers — sync DB write today. */
export interface NotificationJobPayload {
  userId: string;
  actorId: string | null;
  type: NotificationType;
  entityId?: string | null;
}

export const NOTIFICATION_QUEUE = Symbol('NOTIFICATION_QUEUE');

export interface NotificationQueuePort {
  enqueue(payload: NotificationJobPayload): Promise<void>;
}
