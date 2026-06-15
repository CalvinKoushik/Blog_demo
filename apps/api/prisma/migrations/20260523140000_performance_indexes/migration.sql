-- Feed & search performance indexes
CREATE INDEX IF NOT EXISTS "Post_createdAt_idx" ON "Post"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Post_type_idx" ON "Post"("type");
CREATE INDEX IF NOT EXISTS "Post_categoryId_idx" ON "Post"("categoryId");
CREATE INDEX IF NOT EXISTS "Post_isPublished_deletedAt_createdAt_idx" ON "Post"("isPublished", "deletedAt", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Profile_collegeName_idx" ON "Profile"("collegeName");
CREATE INDEX IF NOT EXISTS "Profile_department_idx" ON "Profile"("department");

CREATE INDEX IF NOT EXISTS "Follow_followerId_idx" ON "Follow"("followerId");
CREATE INDEX IF NOT EXISTS "Follow_followingId_idx" ON "Follow"("followingId");

CREATE INDEX IF NOT EXISTS "Bookmark_userId_createdAt_idx" ON "Bookmark"("userId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Like_userId_createdAt_idx" ON "Like"("userId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Comment_authorId_createdAt_idx" ON "Comment"("authorId", "createdAt" DESC);
