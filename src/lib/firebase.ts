// src/lib/firebase.ts

// IMPORTANT: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyYOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (placeholder, actual initialization might differ based on admin vs client SDK)
// import { initializeApp, getApps } from 'firebase/app';
// if (!getApps().length) {
//   initializeApp(firebaseConfig);
// }
// export { firebaseConfig }; // or export the initialized app

console.log("Firebase config loaded (placeholder):", firebaseConfig.projectId);

// Firestore Post Document Structure (e.g., in a 'posts' collection)
// interface FirestorePost {
//   id?: string; // Document ID, often same as slug
//   title: string;
//   slug: string;
//   publishDate: import('firebase/firestore').Timestamp; // Or string ISO 8601
//   updateDate?: import('firebase/firestore').Timestamp; // Or string ISO 8601
//   category: string;
//   tags?: string[]; // For future use
//   content: string; // Markdown content
// }

import { mockPosts, PostListItem, PostDetail, getMockPostListItems } from './mockData';

// We will define PostListItem and PostDetail in a separate types file or reuse/modify existing ones.
// For now, this file focuses on config and data fetching functions.

/**
 * Simulates fetching all posts for list views.
 * Returns a promise resolving to an array of PostListItem objects,
 * sorted by publishDate in descending order.
 */
export const getAllPosts = async (): Promise<PostListItem[]> => {
  console.log("Simulating getAllPosts fetch from Firestore...");
  // Simulate async delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Use getMockPostListItems to get items without 'content'
  const posts = getMockPostListItems();

  // Sort by publishDate (descending)
  // Assuming publishDate is "YYYY-MM-DD"
  posts.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  
  return posts;
};

/**
 * Simulates fetching a single post by its slug, including content.
 * Returns a promise resolving to a PostDetail object or null if not found.
 */
export const getPostBySlug = async (slug: string): Promise<PostDetail | null> => {
  console.log(`Simulating getPostBySlug fetch for slug: ${slug} from Firestore...`);
  // Simulate async delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const post = mockPosts.find(p => p.slug === slug);

  if (post) {
    return post; // mockPosts already contains PostDetail items (with content)
  } else {
    return null;
  }
};

// export {}; // Temporary export to make this a module - no longer needed
