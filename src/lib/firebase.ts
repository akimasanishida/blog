// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    query, 
    orderBy, 
    Timestamp,
    Firestore
} from 'firebase/firestore';
import type { PostListItem, PostDetail } from '../types/post'; // Adjust path as needed after moving types

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

console.log("Firebase app initialized with projectId:", firebaseConfig.projectId);

/**
 * Fetches all posts for list views from Firestore.
 * Returns a promise resolving to an array of PostListItem objects,
 * sorted by publishDate in descending order.
 */
export const getAllPosts = async (): Promise<PostListItem[]> => {
  try {
    console.log("Fetching all posts from Firestore...");
    const postsCollection = collection(db, "posts");
    // Order by publishDate descending. Ensure 'publishDate' field exists and is a Timestamp.
    const q = query(postsCollection, orderBy("publishDate", "desc"));
    const querySnapshot = await getDocs(q);

    const posts: PostListItem[] = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        slug: docSnap.id, // Using document ID as slug
        title: data.title || "Untitled",
        publishDate: (data.publishDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updateDate: (data.updateDate as Timestamp)?.toDate().toISOString(),
        category: data.category || "Uncategorized",
        // tags: data.tags || [], // If you add tags later
      };
    });
    
    console.log(`Fetched ${posts.length} posts.`);
    return posts;
  } catch (error) {
    console.error("Error fetching all posts:", error);
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
    console.log(`Fetching post with slug (doc ID): ${slug} from Firestore...`);
    const postDocRef = doc(db, "posts", slug);
    const docSnap = await getDoc(postDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const post: PostDetail = {
        slug: docSnap.id,
        title: data.title || "Untitled",
        publishDate: (data.publishDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updateDate: (data.updateDate as Timestamp)?.toDate().toISOString(),
        category: data.category || "Uncategorized",
        content: data.content || "", // Markdown content
        // tags: data.tags || [], // If you add tags later
      };
      console.log(`Fetched post: ${post.title}`);
      return post;
    } else {
      console.log(`No post found with slug: ${slug}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    return null; // Or throw error, based on strategy
  }
};
