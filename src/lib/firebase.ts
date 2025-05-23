// src/lib/firebase.ts

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmGTu-5lUETPjrs9S9RydWLDlSVVhuaos",
  authDomain: "blog-c0adf.firebaseapp.com",
  projectId: "blog-c0adf",
  storageBucket: "blog-c0adf.firebasestorage.app",
  messagingSenderId: "146637879129",
  appId: "1:146637879129:web:3532709b31eb7d178afe48"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

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
