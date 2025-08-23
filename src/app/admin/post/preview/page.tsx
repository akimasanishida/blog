"use client";

import { useEffect, useState } from "react";
import ArticleBody from "@/components/ArticleBody";
import { Post } from "@/types/post";
import { renderMarkdownToHTML } from "@/lib/markdown";
import { formatJpDateFromTimestamp } from "@/lib/format";

const SESSION_STORAGE_KEY = "postPreviewData";

export default function PostPreviewPageClient() {
  const [postData, setPostData] = useState<Post | null>(null);
  const [contentHtml, setContentHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedData = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (
          parsedData &&
          typeof parsedData.title === "string" &&
          typeof parsedData.content === "string"
        ) {
          setPostData(parsedData as Post);
          // Markdown to HTML
          renderMarkdownToHTML(parsedData.content).then((html) => {
            setContentHtml(html);
          });
        } else {
          setError(
            "Preview data is incomplete or malformed. It must contain at least a title and content."
          );
          console.warn("Malformed preview data from sessionStorage:", parsedData);
        }
      } else {
        setError(
          "No preview data found. Please generate a preview from the post editor."
        );
      }
    } catch (e) {
      console.error(
        "Error retrieving or parsing preview data from sessionStorage:",
        e
      );
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
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        Loading preview data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="container mx-auto p-4 text-center">
        No post data available for preview.
      </div>
    );
  }

  // 日付・カテゴリを抽出
  console.log("Post data for preview:", postData);
  const publishDateStr: string | undefined = formatJpDateFromTimestamp(postData.publishDate);
  const updateDateStr: string | undefined = formatJpDateFromTimestamp(postData.updateDate);
  const categoryStr: string | undefined = postData.category;

  return (
    <ArticleBody
      title={postData.title}
      contentHtml={contentHtml}
      publishDate={publishDateStr}
      updateDate={updateDateStr}
      category={categoryStr}
      showShareLinks={false}
    />
  );
}
