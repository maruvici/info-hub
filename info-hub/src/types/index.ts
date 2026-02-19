export type Role = 'User' | 'Admin';
export type Team = 'Digital Transformation' | 'Service Delivery' | 'Project Management' | 'Infrastructure' | 'Security' | 'Product';
export type PostType = 'Article' | 'Discussion' | 'Inquiry';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  team: Team;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string; // HTML or Markdown string
  author: User;
  type: PostType;
  tags: string[];
  views: number;
  likes_count: number;
  comments_count: number;
  has_liked: boolean; // For UI state
  created_at: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  likes_count: number;
  has_liked: boolean;
  created_at: string;
  replies?: Comment[]; // Nested replies
}