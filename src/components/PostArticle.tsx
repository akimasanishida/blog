// src/components/PostArticle.tsx
'use server';

import { renderMarkdownToHTML } from '@/lib/markdown';
import { formatJpDate } from '@/lib/format';
import { CalendarPlus } from '@/components/Icons';
import { Timestamp } from 'firebase/firestore';

export interface PostDataForArticle {
  title: string;
  content: string; // Raw Markdown content
  category?: string;
  publishDate?: string | Date | Timestamp;
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

  // Helper logic to prepare date for formatJpDate
  let finalDateToDisplay: string | null = null;
  if (post.publishDate) {
    let dateObject: Date | undefined = undefined;
    if (post.publishDate instanceof Timestamp) {
      dateObject = post.publishDate.toDate();
    } else if (typeof post.publishDate === 'string') {
      const parsedDate = new Date(post.publishDate);
      if (!isNaN(parsedDate.getTime())) {
        dateObject = parsedDate;
      } else {
        // If string is not a valid date, we might display it as is or not at all.
        // For this restoration, let's try to format if possible, else show string.
        // However, formatJpDate expects a Date object or a string that can be parsed into one.
        // So, if it's an unparsable string, we'll not use formatJpDate.
        // The example implies formatJpDate can take a string, but its current lib/format.ts expects string that new Date() can parse.
        // Let's stick to passing a Date object to formatJpDate.
        // If it's a non-date string, we'll handle it by not calling formatJpDate.
        // For preview, it's likely an ISO string, which is parsable.
      }
    } else if (post.publishDate instanceof Date) {
      dateObject = post.publishDate;
    }

    if (dateObject) {
      finalDateToDisplay = formatJpDate(dateObject.toISOString()); // formatJpDate takes string
    } else if (typeof post.publishDate === 'string') {
        // If it was a string but not parsable into a valid Date object
        finalDateToDisplay = post.publishDate; // Display the original string
    }
  }

  return (
    <article className='prose dark:prose-invert max-w-full'>
      <header className='mb-6 pb-4 border-b'>
        <h1 className='text-4xl mb-2'>{post.title || "Untitled Post"}</h1>
        {(post.category || finalDateToDisplay) && (
          <div className='text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1'>
            {finalDateToDisplay && (
              <span className='flex items-center'>
                <CalendarPlus className='inline-block w-5 h-5 mr-1'/> 
                {finalDateToDisplay}
              </span>
            )}
            {post.category && (
              <span className='flex items-center'>
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
