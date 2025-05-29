// src/components/PostArticle.tsx
'use server';

import { renderMarkdownToHTML } from '@/lib/markdown';
import { formatJpDate } from '@/lib/format';
import { CalendarPlus } from '@/components/Icons'; // Assuming ClockClockwise is not needed for preview
import { Timestamp } from 'firebase/firestore'; // For type definition

// Define the PostData interface for the post prop
// This should align with how Post data is structured for preview (from sessionStorage)
// and be compatible with the actual PostDetail type where possible.
export interface PostDataForArticle {
  title: string;
  content: string; // Raw Markdown content
  category?: string;
  publishDate?: string | Date | Timestamp; // Allow various date types, as it comes from client/session or server
  // Add other fields if necessary, e.g., slug, author, etc.
}

interface PostArticleProps {
  post: PostDataForArticle;
}

export default async function PostArticle({ post }: PostArticleProps) {
  if (!post) {
    return (
      <div className="text-center py-10">
        <p>No post data provided to PostArticle.</p>
      </div>
    );
  }

  const { contentHtml } = await renderMarkdownToHTML(post.content || "");

  let displayDate: string | null = null;
  if (post.publishDate) {
    if (post.publishDate instanceof Timestamp) {
      displayDate = formatJpDate(post.publishDate.toDate().toISOString());
    } else if (typeof post.publishDate === 'string') {
      // Attempt to parse if it's a full ISO string or just date part
      const dateObj = new Date(post.publishDate);
      if (!isNaN(dateObj.getTime())) {
        displayDate = formatJpDate(dateObj.toISOString()); // Standardize to full format via formatJpDate
      } else {
        displayDate = post.publishDate; // Fallback to string if not parsable
      }
    } else if (post.publishDate instanceof Date) {
      displayDate = formatJpDate(post.publishDate.toISOString());
    }
  }


  return (
    <article className='prose dark:prose-invert max-w-full'>
      <header className='mb-6 pb-4 border-b'>
        <h1 className='text-4xl mb-2'>{post.title || "Untitled Post"}</h1>
        {(post.category || displayDate) && (
          <div className='text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1'>
            {displayDate && (
              <span className='flex items-center'>
                <CalendarPlus className='inline-block w-5 h-5 mr-1'/> 
                {displayDate}
              </span>
            )}
            {post.category && (
              <span className='flex items-center'>
                {/* Replicating structure from [slug]/page.tsx for category if needed */}
                {/* For preview, simple display might be enough */}
                <span>Category: </span>
                <span className='font-bold ml-1'>{post.category}</span>
              </span>
            )}
          </div>
        )}
      </header>
      <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </article>
  );
}
