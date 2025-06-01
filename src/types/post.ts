// src/types/post.ts
import { Timestamp } from 'firebase/firestore';

export interface Post {
  slug?: string; // URL
  title: string;
  content: string; // Raw Markdown content
  category: string;
  isPublic: boolean;  // Whether the post is public or draft
  publishDate?: Timestamp;
  updateDate?: Timestamp;
  tags: string[]; // Optional, for future use
}

export interface PostWithId extends Post {
  id: string; // Ensures that id is always present
}