// Defines the structure for a blog post.

/**
 * Represents a blog post.
 * The structure is based on the details provided in design.md.
 */
export interface Post {
  title?: string; // Optional title of the post
  slug: string; // URL-friendly identifier for the post
  publishDate: Date; // Date when the post was published
  updateDate?: Date; // Optional date when the post was last updated
  category?: string; // Optional category of the post
  tags?: string[]; // Optional tags associated with the post (for future expansion)
  content?: string; // Optional Markdown content of the post
  isPublic: boolean; // Whether the post is publicly visible or a draft
}

/**
 * Represents a blog post including its Firestore document ID.
 * Extends the Post interface to add the `id` field.
 */
export interface PostWithId extends Post {
  id: string; // The Firestore document ID of the post
}
