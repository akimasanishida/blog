// src/lib/firebaseServer.ts
import 'server-only';
import { adminDb } from './firebaseAdmin';
import { cookies } from 'next/headers';
import type { Post, PostWithId } from '../types/post';

/**
 * Check if the current user has access to read posts based on site visibility and authentication status
 */
const canAccessPostsServer = async (): Promise<boolean> => {
  const siteVisibility = process.env.NEXT_PUBLIC_SITE_VISIBILITY || 'public';
  
  if (siteVisibility === 'public') {
    return true;
  }
  
  if (siteVisibility === 'private') {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('session');
      return !!sessionCookie;
    } catch {
      // If cookies() fails (e.g., in client-side context), assume not authenticated
      return false;
    }
  }
  
  return false;
};

/**
 * Fetches all posts with their full content from Firestore using Admin SDK.
 * Returns a promise resolving to an array of Post objects,
 * sorted by publishDate in descending order.
 * Access is controlled by site visibility and user authentication status.
 */
export const getAllPosts = async (): Promise<Post[]> => {
  try {
    // Check if user has access to read posts
    const hasAccess = await canAccessPostsServer();
    if (!hasAccess) {
      return [];
    }

    const postsCollection = adminDb.collection('posts');
    const q = postsCollection
      .where('isPublic', '==', true)
      .orderBy('publishDate', 'desc');
    
    const querySnapshot = await q.get();

    const posts: Post[] = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        slug: data.slug,
        title: data.title || 'untitled',
        isPublic: data.isPublic,
        publishDate: data.publishDate || undefined,
        updateDate: data.updateDate || undefined,
        category: data.category || 'uncategorized',
        content: data.content || '',
        tags: data.tags || [],
      };
    });
    
    return posts;
  } catch {
    return [];
  }
};

/**
 * Fetches a single post by its slug from Firestore using Admin SDK.
 * Returns a promise resolving to a Post object or null if not found.
 * Access is controlled by site visibility and user authentication status.
 */
export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  try {
    // Check if user has access to read posts
    const hasAccess = await canAccessPostsServer();
    if (!hasAccess) {
      return null;
    }

    const postsCollection = adminDb.collection('posts');
    const q = postsCollection
      .where('slug', '==', slug)
      .where('isPublic', '==', true);
    
    const querySnapshot = await q.get();

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      const post: Post = {
        slug: data.slug,
        title: data.title || 'untitled',
        isPublic: data.isPublic,
        publishDate: data.publishDate || undefined,
        updateDate: data.updateDate || undefined,
        category: data.category || 'uncategorized',
        content: data.content || '',
        tags: data.tags || [],
      };
      return post;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};

/**
 * Fetches all posts including drafts for admin use.
 * Returns a promise resolving to an array of PostWithId objects,
 * sorted by publishDate in descending order.
 */
export const getAllPostsForAdmin = async (): Promise<PostWithId[]> => {
  try {
    const postsCollection = adminDb.collection('posts');
    const q = postsCollection.orderBy('publishDate', 'desc');
    
    const querySnapshot = await q.get();

    const posts: PostWithId[] = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        slug: data.slug,
        title: data.title || 'untitled',
        isPublic: data.isPublic,
        publishDate: data.publishDate || undefined,
        updateDate: data.updateDate || undefined,
        category: data.category || 'uncategorized',
        content: data.content || '',
        tags: data.tags || [],
      };
    });
    
    return posts;
  } catch (error) {
    console.error('Error in getAllPostsForAdmin:', error);
    throw error; // Re-throw to see the actual error
  }
};
