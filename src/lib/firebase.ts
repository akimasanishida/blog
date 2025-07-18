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
import type { Post, PostWithId } from '../types/post'; // Adjust path as needed after moving types

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
 * Returns a promise resolving to an array of Post objects,
 * sorted by publishDate in descending order.
 */
export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const postsCollection = collection(db, "posts");
    // 追加: isPublic が true のみ取得
    const q = query(
      postsCollection,
      where("isPublic", "==", true),
      orderBy("publishDate", "desc")
    );
    const querySnapshot = await getDocs(q);

    const posts: Post[] = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        slug: data.slug,
        title: data.title || "untitled",
        isPublic: data.isPublic,
        publishDate: data.publishDate as Timestamp || undefined,
        updateDate: data.updateDate as Timestamp || undefined,
        category: data.category || "uncategorized",
        content: data.content || "",
        tags: data.tags || [],
      };
    });
    
    return posts;
  } catch {
    return [];
  }
};

export const getAllPostsForAdmin = async (): Promise<PostWithId[]> => {
  try {
    const postsCollection = collection(db, "posts");
    // 追加: isPublic の制限なし
    const q = query(
      postsCollection,
      orderBy("publishDate", "desc")
    );
    const querySnapshot = await getDocs(q);

    const posts: PostWithId[] = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        slug: data.slug,
        title: data.title || "untitled",
        isPublic: data.isPublic,
        publishDate: data.publishDate as Timestamp || undefined,
        updateDate: data.updateDate as Timestamp || undefined,
        category: data.category || "uncategorized",
        content: data.content || "",
        tags: data.tags || [],
      };
    });
    return posts;
  } catch {
    return [];
  }
};

/**
 * Fetches a single post by its slug (document ID) from Firestore.
 * Returns a promise resolving to a Post object or null if not found.
 */
export const getPostBySlug = async (slug: string): Promise<Post | null> => {
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
      const post: Post = {
        slug: data.slug,
        title: data.title || "untitled",
        isPublic: data.isPublic,
        publishDate: data.publishDate as Timestamp || undefined,
        updateDate: data.updateDate as Timestamp || undefined,
        category: data.category || "uncategorized",
        content: data.content || "",
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
