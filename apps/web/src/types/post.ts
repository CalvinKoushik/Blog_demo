import type { PostType } from "./post-enums";

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ApiPostAuthor {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
    nickname: string | null;
    avatarUrl: string | null;
    collegeName?: string | null;
    department?: string | null;
  } | null;
}

export interface ApiPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: PostType;
  thumbnailUrl: string | null;
  techStack: string[];
  viewCount: number;
  createdAt: string;
  author: ApiPostAuthor;
  category: ApiCategory | null;
  _count?: { likes: number; comments: number };
  likedByMe?: boolean;
  bookmarkedByMe?: boolean;
  isPublished?: boolean;
}

export interface FeedPostCard {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  author: {
    name: string;
    username: string;
    avatar: string | null;
    role: string;
  };
  tags: string[];
  category: string;
  likes: number;
  comments: number;
  likedByMe?: boolean;
  bookmarkedByMe?: boolean;
  timeAgo: string;
  readTime: string;
  thumbnail: string | null;
}

export type CreatePostPayload = {
  title: string;
  content: string;
  categorySlug: string;
  type: PostType;
  techStack?: string[];
  thumbnailUrl?: string;
  isPublished?: boolean;
};

export type UpdatePostPayload = Partial<CreatePostPayload>;
