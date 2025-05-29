// src/components/PostArticle.tsx
'use client';

import { useEffect, useState } from 'react';
import { renderMarkdownToHTML } from '@/lib/markdown';
import { Timestamp } from 'firebase/firestore';
import ArticleBody from './ArticleBody';

export interface PostDataForArticle {
  title: string;
  content: string; // Raw Markdown content
  category?: string;
  publishDate?: string | Date | Timestamp;
  updateDate?: string | Date | Timestamp;
}

interface PostArticleProps {
  post: PostDataForArticle;
}

export default function PostArticle({ post }: PostArticleProps) {
  const [contentHtml, setContentHtml] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    async function render() {
      const { contentHtml } = await renderMarkdownToHTML(post.content || "");
      if (isMounted) setContentHtml(contentHtml);
    }
    render();
    return () => { isMounted = false; };
  }, [post.content]);

  if (!post) {
    return (
      <div className="text-center py-10">
        <p>No post data provided to PostArticle.</p>
      </div>
    );
  }

  // publishDate, updateDate の型を string | Date | undefined に揃える
  let publishDate: string | Date | undefined = undefined;
  if (post.publishDate instanceof Timestamp) {
    publishDate = post.publishDate.toDate();
  } else if (post.publishDate !== undefined) {
    publishDate = post.publishDate as string | Date;
  }

  let updateDate: string | Date | undefined = undefined;
  if (post.updateDate instanceof Timestamp) {
    updateDate = post.updateDate.toDate();
  } else if (post.updateDate !== undefined) {
    updateDate = post.updateDate as string | Date;
  }

  return (
    <ArticleBody
      title={post.title}
      contentHtml={contentHtml}
      category={post.category}
      publishDate={publishDate}
      updateDate={updateDate}
      showCategoryLink={false}
      showShareLinks={false}
    />
  );
}
