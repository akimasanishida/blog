// src/components/PostArticle.tsx
'use client';

import { useEffect, useState } from 'react';
import { renderMarkdownToHTML } from '@/lib/markdown';
import ArticleBody from './ArticleBody';
import type { Post } from '@/types/post';

export default function PostArticle({ post }: { post: Post }) {
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

  return (
    <ArticleBody
      title={post.title}
      contentHtml={contentHtml}
      category={post.category}
      publishDate={post.publishDate}
      updateDate={post.updateDate}
      showCategoryLink={false}
      showShareLinks={false}
    />
  );
}
