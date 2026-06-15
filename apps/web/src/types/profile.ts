import type { ApiPost } from "./post";

export interface ProfileResponse {
  firstName: string;
  lastName: string;
  nickname: string | null;
  avatarUrl: string | null;
  bio: string | null;
  collegeName: string | null;
  department: string | null;
  year: number | null;
  skills: string[];
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  user: {
    createdAt: string;
    posts?: ApiPost[];
    _count?: {
      followers: number;
      following: number;
      posts: number;
    };
  };
}
