// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
    getFirestore, 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    where,
    Timestamp,
    Firestore
} from 'firebase/firestore';
import type { PostDetail } from '../types/post'; // Adjust path as needed after moving types

// Confirmed Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Using environment variables
  authDomain: "blog-c0adf.firebaseapp.com",
  projectId: "blog-c0adf",
  storageBucket: "blog-c0adf.appspot.com",
  messagingSenderId: "969161089145",
  appId: "1:969161089145:web:f334c13a9751c75a4892ff"
};

// Initialize Firebase app
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const db: Firestore = getFirestore(app);

/**
 * Fetches all posts with their full content from Firestore.
 * Returns a promise resolving to an array of PostDetail objects,
 * sorted by publishDate in descending order.
 */
export const getAllPosts = async (): Promise<PostDetail[]> => {
  try {
    const postsCollection = collection(db, "posts");
    // Order by publishDate descending. Ensure 'publishDate' field exists and is a Timestamp.
    const q = query(postsCollection, orderBy("publishDate", "desc"));
    const querySnapshot = await getDocs(q);

    const posts: PostDetail[] = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        slug: data.slug, // Using document ID as slug
        title: data.title || "untitled",
        publishDate: (data.publishDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updateDate: (data.updateDate as Timestamp)?.toDate().toISOString(),
        category: data.category || "uncategorized",
        content: data.content || "", // Add content field
        // tags: data.tags || [], // If you add tags later
      };
    });
    
    return posts;
  } catch {
    // Depending on error handling strategy, you might throw the error,
    // return an empty array, or return a specific error object.
    return []; 
  }
};

/**
 * Fetches a single post by its slug (document ID) from Firestore.
 * Returns a promise resolving to a PostDetail object or null if not found.
 */
export const getPostBySlug = async (slug: string): Promise<PostDetail | null> => {
  try {
    const postsCollection = collection(db, "posts");
    const q = query(postsCollection, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      const post: PostDetail = {
        slug: data.slug,
        title: data.title || "untitled",
        publishDate: (data.publishDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updateDate: (data.updateDate as Timestamp)?.toDate().toISOString(),
        category: data.category || "uncategorized",
        content: data.content || "",
      };
      return post;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};
