// src/app/admin/post/preview/page.tsx
"use client";

import { useEffect, useState, Suspense } from 'react'; // Ensure Suspense is imported
import PostArticle from '@/components/PostArticle'; 
import { Timestamp } from 'firebase/firestore'; // Or other relevant date types

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
    setIsLoading(true); // Set loading true at the start of effect
    try {
      const storedData = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Optional: Add validation for parsedData structure here if needed
        if (parsedData && typeof parsedData.title === 'string' && typeof parsedData.content === 'string') {
          setPostData(parsedData as PreviewPostData);
        } else {
          setError("Preview data is incomplete or malformed. It must contain at least a title and content.");
          console.warn("Malformed preview data from sessionStorage:", parsedData);
        }
      } else {
        setError("No preview data found. Please generate a preview from the post editor.");
      }
    } catch (e) {
      console.error("Error retrieving or parsing preview data from sessionStorage:", e);
      if (e instanceof SyntaxError) {
        setError("Failed to load preview data: The stored data is not valid JSON.");
      } else if (e instanceof Error) {
        setError(`Failed to load preview data: ${e.message}`);
      } else {
        setError("Failed to load preview data due to an unexpected error.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array, runs once

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading preview data...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error}</div>;
  }

  if (!postData) {
    return <div className="container mx-auto p-4 text-center">No post data available for preview.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div className="container mx-auto p-4 text-center">Processing content...</div>}>
        <PostArticle post={postData} />
      </Suspense>
    </div>
  );
}
