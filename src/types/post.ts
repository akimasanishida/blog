// src/types/post.ts

/**
 * Represents the data structure for a post item in a list.
 * Dates are represented as ISO 8601 strings.
 */
export interface PostListItem {
  slug: string;        // Document ID from Firestore, used as slug
  title: string;
  publishDate: string; // ISO 8601 string (e.g., "2024-01-15T10:00:00.000Z")
  updateDate?: string; // ISO 8601 string, optional
  category: string;
  // tags?: string[];  // Optional, for future use
}

/**
 * Represents the detailed data structure for a single post, including its content.
 * Extends PostListItem.
 */
export interface PostDetail extends PostListItem {
  content: string; // Markdown content (to be rendered to HTML)
  // Potentially other fields like author, full metadata etc.
}
