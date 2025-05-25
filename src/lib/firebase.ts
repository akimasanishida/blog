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
import { getAuth, Auth } from 'firebase/auth'; // Added for Firebase Auth
import { getStorage, FirebaseStorage } from 'firebase/storage'; // Added for Firebase Storage
import type { PostDetail } from '../types/post'; // Adjust path as needed after moving types

// Confirmed Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app); // Added for Firebase Auth
const storage: FirebaseStorage = getStorage(app); // Added for Firebase Storage

export { app, db, auth, storage }; // Export storage

/**
 * Fetches all posts with their full content from Firestore.
 * Returns a promise resolving to an array of PostDetail objects,
 * sorted by publishDate in descending order.
 */
export const getAllPosts = async (): Promise<PostDetail[]> => {
  try {
    const postsCollection = collection(db, "posts");
    // 追加: isPublic が true のみ取得
    const q = query(
      postsCollection,
      where("isPublic", "==", true),
      orderBy("publishDate", "desc")
    );
    const querySnapshot = await getDocs(q);

    const posts: PostDetail[] = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        slug: data.slug,
        title: data.title || "untitled",
        publishDate: (data.publishDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updateDate: (data.updateDate as Timestamp)?.toDate().toISOString(),
        category: data.category || "uncategorized",
        content: data.content || "",
      };
    });
    
    return posts;
  } catch {
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
    // 追加: isPublic が true のみ取得
    const q = query(
      postsCollection,
      where("slug", "==", slug),
      where("isPublic", "==", true)
    );
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
