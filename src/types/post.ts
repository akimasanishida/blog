// src/types/post.ts

export interface Post {
  slug?: string; // Document ID from Firestore, used as slug
  title: string;
  content: string; // Raw Markdown content
  category: string;
  publishDate?: Date;
  updateDate?: Date;
  tags: string[]; // Optional, for future use
}

export interface PostList {
  posts: Post[];
}