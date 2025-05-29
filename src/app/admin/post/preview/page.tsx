// src/app/admin/post/preview/page.tsx
"use client";

import { useEffect, useState } from 'react';
import PostArticle from '@/components/PostArticle';
import { Timestamp } from 'firebase/firestore'; // For type consistency with PostArticle's PostData

// Define a simple PostData interface for the preview data
// This should align with the structure stored in sessionStorage
// and be compatible with PostArticle's expected props.
interface PreviewPostData {
  title: string;
  content: string;
  category?: string;
  publishDate?: string | Date | Timestamp; // Allow flexibility for data from sessionStorage
                                        // PostArticle's formatDate can handle string or Date.
}

const SESSION_STORAGE_KEY = 'postPreviewData';

export default function PostPreviewPage() {
  const [postData, setPostData] = useState<PreviewPostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect should only run on the client side.
    if (typeof window !== 'undefined') {
      try {
        const storedDataString = sessionStorage.getItem(SESSION_STORAGE_KEY);

        if (storedDataString) {
          const parsedData = JSON.parse(storedDataString);

          // Basic validation: Ensure essential fields are present
          if (parsedData && typeof parsedData.title === 'string' && typeof parsedData.content === 'string') {
            // Optional: Convert date string back to Date object if needed by PostArticle,
            // but PostArticle's formatDate is robust enough for ISO strings.
            // if (parsedData.publishDate && typeof parsedData.publishDate === 'string') {
            //   parsedData.publishDate = new Date(parsedData.publishDate);
            // }
            setPostData(parsedData as PreviewPostData);
          } else {
            setError("Preview data is incomplete or malformed. It must contain at least a title and content.");
            console.warn("Malformed preview data:", parsedData);
          }
        } else {
          setError("No preview data found. Please generate a preview from the post editor.");
        }
      } catch (e) {
        console.error("Error retrieving or parsing preview data from sessionStorage:", e);
        if (e instanceof SyntaxError) {
          setError("Failed to load preview data: The stored data is not valid JSON.");
        } else {
          setError("Failed to load preview data due to an unexpected error.");
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Should not happen if "use client" is effective, but as a fallback.
      setError("SessionStorage is not available.");
      setIsLoading(false);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
        <p className="text-lg text-muted-foreground">Loading preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
        <p className="text-lg text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-md">
          {error}
        </p>
      </div>
    );
  }

  if (!postData) {
    // This case should ideally be covered by the error state if data is not found or malformed.
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
        <p className="text-lg text-muted-foreground">No post data available for preview.</p>
      </div>
    );
  }

  // PostArticle is a Server Component, but can be used in Client Components.
  // Next.js handles this interaction. Props must be serializable.
  // Since postData comes from JSON.parse, it's already serializable.
  return (
    // The PostArticle component already has `mx-auto` and padding.
    // Adding a general container here for the page itself if needed,
    // or PostArticle can be the top-level element if full-width bleed is desired.
    // For consistency with loading/error states, we'll wrap it.
    <div className="bg-background text-foreground min-h-screen"> 
      {/* 
        The PostArticle component includes Tailwind's typography classes (`prose`).
        It also handles its own padding and max-width for the article content.
        Therefore, this outer div is mainly for page-level background or structure if ever needed.
      */}
      <PostArticle post={postData} />
    </div>
  );
}
