export interface IUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  bio: string;
  address: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  websiteUrl: string;
  specialization: string;
  college: string;
  graduationYear: number;
  skills: string[];
  experienceLevel: string;
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
    full_name: string;
    avatar_url: string | null;
  };
  replies: Comment[];
  _count: {
    likes: number;
    replies: number;
  };
  depth?: number;
}
