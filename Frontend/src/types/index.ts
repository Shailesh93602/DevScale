// ─── Role / RBAC ─────────────────────────────────────────────────────────────
// IMPORTANT: add new roles here; the system is designed for easy role extension
export type UserRole = 'ADMIN' | 'STUDENT' | 'MODERATOR' | string;

export interface IUserRole {
  id: string;
  name: UserRole;
  description?: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface IUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string;
  bio: string;
  address: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  website_url: string;
  specialization: string;
  college: string;
  graduation_year: number;
  skills: string[];
  experience_level: string;
  role?: IUserRole | null;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  isLiked: boolean;
  parent_id: string | null;
  roadmap_id: string;
  article_id: string | null;
  user_id: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  replies: Comment[];
  _count: {
    likes: number;
    replies: number;
  };
  depth?: number;
}
