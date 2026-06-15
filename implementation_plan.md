# Student Community Platform Implementation Plan

This document outlines the architecture, database schema, folder structure, and technical strategy for building a modern full-stack student community platform inspired by LinkedIn and Hashnode.

## ⚠️ User Review Required
Please review the proposed tech stack, folder structure, and database schema. Once approved, I will begin scaffolding the monorepo and setting up the foundations.

## ❓ Open Questions
1. **Monorepo Tooling**: I plan to use `Turborepo` or `Nx` to manage the monorepo since we have a React frontend and NestJS backend. Alternatively, we can use a simple Yarn/pnpm workspace. Do you have a preference? (I will assume **pnpm workspaces + Turborepo** for optimal performance).
2. **Authentication**: You mentioned "JWT Authentication" and "Supabase Auth support preparation". I will design the NestJS backend to handle JWT auth (signup/login) with its own `User` table, while keeping the architecture modular so it can easily swap to Supabase Auth in the future. Does this align with your vision?

---

## 1. System Architecture

We will implement a clean monorepo architecture separating the frontend, backend, and shared packages.

### Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, React Router, TanStack Query, Zustand.
- **Backend**: NestJS, TypeScript, Prisma ORM (pooled connections), REST APIs.
- **Database**: Supabase PostgreSQL.
- **Storage**: Cloudinary (prepared for Supabase Storage).
- **Deployment**: Vercel (Frontend), Railway/Render (Backend).

### Folder Structure
```text
.
├── apps/
│   ├── api/                  # NestJS Backend
│   │   ├── prisma/           # ONLY place for Prisma schema and migrations
│   │   ├── src/
│   │   │   ├── modules/      # Feature modules (Auth, Users, Posts, etc.)
│   │   │   ├── common/       # Guards, Interceptors, Filters
│   │   │   └── main.ts
│   │   └── .env.example
│   └── web/                  # React Frontend (Vite)
│       ├── src/
│       │   ├── components/   # Reusable UI components (shadcn)
│       │   ├── features/     # Feature-based domains (auth, feed, profile)
│       │   ├── pages/        # Route components
│       │   ├── store/        # Zustand stores
│       │   ├── lib/          # Utils, Axios/Query clients
│       │   └── main.tsx
│       └── .env.example
├── packages/                 # Shared logic (if needed in future, e.g., types)
├── package.json
└── turbo.json
```

---

## 2. Database Design (Prisma Schema)

The database will be hosted on Supabase PostgreSQL. Prisma will be localized entirely within `apps/api`.

```prisma
// apps/api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Role {
  ADMIN
  STUDENT
  VISITOR
}

enum PostType {
  PROJECT
  BLOG
  TUTORIAL
  RESEARCH
  ACHIEVEMENT
  HACKATHON
}

model User {
  id             String    @id @default(uuid())
  email          String    @unique
  passwordHash   String
  role           Role      @default(STUDENT)
  isVerified     Boolean   @default(false)
  refreshToken   String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  profile        Profile?
  posts          Post[]
  comments       Comment[]
  likes          Like[]
  bookmarks      Bookmark[]
  followers      Follow[]  @relation("Following")
  following      Follow[]  @relation("Followers")
  notifications  Notification[]
}

model Profile {
  id             String    @id @default(uuid())
  userId         String    @unique
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  firstName      String
  lastName       String
  nickname       String?   // For guest visitors if they register later
  bio            String?   @db.Text
  collegeName    String?
  department     String?
  year           Int?
  skills         String[]
  linkedinUrl    String?   // Mandatory in application logic
  githubUrl      String?
  portfolioUrl   String?
  resumeUrl      String?
  avatarUrl      String?
  
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model Post {
  id             String    @id @default(uuid())
  authorId       String
  author         User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  title          String
  slug           String    @unique
  content        String    @db.Text // Markdown content
  type           PostType
  thumbnailUrl   String?
  techStack      String[]
  githubUrl      String?
  liveDemoUrl    String?
  youtubeUrl     String?
  documentUrl    String?   // PDF/PPT
  
  viewCount      Int       @default(0)
  isPublished    Boolean   @default(true)
  isFeatured     Boolean   @default(false)

  category       Category  @relation(fields: [categoryId], references: [id])
  categoryId     String
  
  comments       Comment[]
  likes          Like[]
  bookmarks      Bookmark[]
  
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model Category {
  id          String   @id @default(uuid())
  name        String   @unique // e.g., Web Development, AI/ML
  slug        String   @unique
  posts       Post[]
}

model Comment {
  id          String    @id @default(uuid())
  content     String    @db.Text
  postId      String
  post        Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId    String?   // Nullable for guest comments
  author      User?     @relation(fields: [authorId], references: [id], onDelete: SetNull)
  guestName   String?   // For visitors without login
  
  parentId    String?
  parent      Comment?  @relation("Replies", fields: [parentId], references: [id], onDelete: Cascade)
  replies     Comment[] @relation("Replies")

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Like {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId      String
  post        Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())

  @@unique([userId, postId])
}

model Bookmark {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId      String
  post        Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())

  @@unique([userId, postId])
}

model Follow {
  followerId  String
  follower    User     @relation("Following", fields: [followerId], references: [id], onDelete: Cascade)
  followingId String
  following   User     @relation("Followers", fields: [followingId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())

  @@id([followerId, followingId])
}

model Notification {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  actorId     String?  // User who triggered it
  type        String   // LIKE, COMMENT, FOLLOW, FEATURE
  entityId    String?  // ID of post, comment, etc.
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

---

## 3. Backend API Structure (NestJS)

We will use a modular, feature-based architecture.

### Modules
- **AuthModule**: Signup, Login, Email Verification, JWT Strategy, Refresh Tokens.
- **UsersModule**: Profile management, follow/unfollow logic.
- **PostsModule**: CRUD for posts, categories, filtering, pagination.
- **InteractionsModule**: Likes, Bookmarks, Comments, Replies.
- **FeedModule**: Algorithms for "For You", "Following", "Trending".
- **UploadModule**: Cloudinary integration for images/PDFs.
- **AdminModule**: Moderation, user management, category management.

### Key Practices
- **Guards**: `JwtAuthGuard` (protect routes), `RolesGuard` (admin vs student), `OptionalJwtAuthGuard` (for endpoints that visitors can access but users get personalized data).
- **Interceptors**: Standardization of API responses.
- **Rate Limiting**: `ThrottlerModule` implemented globally to prevent spam.

---

## 4. Frontend Page Structure & UI/UX

### Core Routes
- `/` - Landing Page / Feed (Dynamic based on Auth state)
- `/explore` - Categories, Search, Trending
- `/login`, `/signup`, `/forgot-password` - Authentication
- `/profile/:username` - Public Profile (Bio, Projects, Resume)
- `/settings` - Profile editing
- `/post/new` - Rich text editor for creating posts
- `/post/:slug` - Post detail view (Markdown rendering, comments)

### State Management
- **TanStack Query**: Server state (Feed data, Post data, Profile data).
- **Zustand**: Client state (Theme toggle, Modals, Auth status).

### Reusable Components (shadcn/ui based)
- `PostCard`: Displays thumbnail, title, author, tech stack, like/view counts.
- `ProfileHeader`: Banner, avatar, stats (followers/following).
- `RichTextEditor`: TipTap or similar for markdown/code editing.
- `CommentSection`: Nested replies, guest commenting support.
- `FeedTabs`: "For You" / "Following" / "Trending" switchers.

### Design Theme
- **Theme**: Light/Dark mode with `next-themes`.
- **Colors**: Emerald Green (#10B981) primary, Dark Slate (#0F172A) secondary.
- **Animations**: Framer Motion for page transitions, card hovers, and skeleton loaders.

---

## 5. Feed Logic
- **For You**: Posts matching user's listed skills and recently interacted categories.
- **Following**: Chronological feed of posts from followed users.
- **Trending**: Calculated based on `(likes * 2) + comments + (views * 0.1)` over the last 7 days.

---

## 6. Environment Variable Structure

### Backend (`apps/api/.env.example`)
```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# JWT Auth
JWT_SECRET="super-secret-key"
JWT_REFRESH_SECRET="super-secret-refresh-key"

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# General
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

### Frontend (`apps/web/.env.example`)
```env
VITE_API_URL="http://localhost:3000/api"
```

---

## 7. Supabase & Deployment Instructions

### Supabase Integration
1. Create a new project in Supabase.
2. Go to Project Settings -> Database.
3. Copy the **Connection Pooling string (Transaction mode)** for `DATABASE_URL`.
4. Copy the **Direct connection string** for `DIRECT_URL`.
5. Run Prisma commands ONLY from the backend directory:
   - `cd apps/api`
   - `npx prisma migrate dev` (Uses DIRECT_URL to create migrations)
   - `npx prisma generate`

### Deployment
- **Frontend (Vercel)**:
  - Framework Preset: Vite
  - Build Command: `npm run build` (or `turbo run build --filter=web`)
  - Root Directory: `apps/web` (if not using turbo at root)
- **Backend (Railway/Render)**:
  - Root Directory: `apps/api`
  - Build Command: `npm run build && npx prisma generate`
  - Start Command: `npm run start:prod`
  - Ensure all Env variables (especially `DATABASE_URL` and `DIRECT_URL`) are provided.

---

## Next Steps upon Approval
1. Initialize pnpm workspace and Turborepo.
2. Scaffold NestJS backend in `apps/api` and set up Prisma schema.
3. Scaffold React Vite frontend in `apps/web` and set up Tailwind/shadcn.
4. Establish the database connection and generate initial migrations.
