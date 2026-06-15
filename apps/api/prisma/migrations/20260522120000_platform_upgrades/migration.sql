-- Soft deletes
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Post_deletedAt_idx" ON "Post"("deletedAt");
CREATE INDEX IF NOT EXISTS "Post_authorId_isPublished_deletedAt_idx" ON "Post"("authorId", "isPublished", "deletedAt");
CREATE INDEX IF NOT EXISTS "Comment_postId_deletedAt_idx" ON "Comment"("postId", "deletedAt");

-- Notification type enum
DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('LIKE', 'COMMENT', 'FOLLOW', 'FEATURE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Notification" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Notification"
  ALTER COLUMN "type" TYPE "NotificationType"
  USING (
    CASE UPPER("type"::text)
      WHEN 'LIKE' THEN 'LIKE'::"NotificationType"
      WHEN 'COMMENT' THEN 'COMMENT'::"NotificationType"
      WHEN 'FOLLOW' THEN 'FOLLOW'::"NotificationType"
      WHEN 'FEATURE' THEN 'FEATURE'::"NotificationType"
      ELSE 'COMMENT'::"NotificationType"
    END
  );

CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_createdAt_idx"
  ON "Notification"("userId", "isRead", "createdAt");

-- Profile nickname unique (may already exist from prior db push)
CREATE UNIQUE INDEX IF NOT EXISTS "Profile_nickname_key" ON "Profile"("nickname");
