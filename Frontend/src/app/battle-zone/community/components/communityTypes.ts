export interface User {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  rank?: number;
  battles_won?: number;
  battles_participated?: number;
  is_online?: boolean;
  is_friend?: boolean;
  last_active?: string;
}

export interface Post {
  id: string;
  user: User;
  content: string;
  image_url?: string;
  likes: number;
  comments: number;
  created_at: string;
  has_liked?: boolean;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  created_at: string;
}
