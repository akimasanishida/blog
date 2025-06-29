// Implements pagination functionality for blog posts.

import { Post } from '../types/post';

/**
 * The maximum number of posts to display on a single page.
 * As per the issue specification, the initial value is 7.
 */
export const NUM_PAGINATION: number = 7;

/**
 * Takes a list of all posts and a page number, and returns the posts
 * for that specific page.
 *
 * @param posts - An array of all Post objects.
 * @param page - The 1-indexed page number to retrieve.
 * @returns An array of Post objects for the specified page, or undefined
 *          if the page number is out of bounds (e.g., less than 1, or
 *          beyond the total number of pages).
 */
export const paginatePost = (
  posts: Post[],
  page: number,
): Post[] | undefined => {
  if (!posts || posts.length === 0) {
    return undefined; // No posts to paginate
  }

  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / NUM_PAGINATION);

  // Validate page number (must be 1-indexed)
  if (page < 1 || page > totalPages) {
    return undefined; // Page number is out of bounds
  }

  const startIndex = (page - 1) * NUM_PAGINATION;
  const endIndex = page * NUM_PAGINATION;

  return posts.slice(startIndex, endIndex);
};
