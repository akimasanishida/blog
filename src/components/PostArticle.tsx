// src/components/PostArticle.tsx
'use server'; // Can be a server component as it processes markdown and renders

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypePrismPlus from 'rehype-prism-plus';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';
import { Timestamp } from 'firebase/firestore'; // For publishDate type

// Define the PostData interface for the post prop
// This should align with how Post data is structured in the application
interface PostData {
  title: string;
  content: string; // Markdown content
  category?: string;
  publishDate?: Date | Timestamp | string; // Allow various date types
  // Add other fields if necessary, e.g., slug, author, etc.
}

interface PostArticleProps {
  post: PostData;
}

// Helper function to format date
// Handles Firebase Timestamp, JavaScript Date object, or string
const formatDate = (dateInput: Date | Timestamp | string | undefined): string | null => {
  if (!dateInput) return null;

  let date: Date;
  if (dateInput instanceof Timestamp) {
    date = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else {
    return null; // Invalid date type
  }

  if (isNaN(date.getTime())) {
    return 'Invalid date'; // Handle invalid date strings
  }

  // Format to YYYY-MM-DD
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Asynchronous function to process markdown content to HTML
async function processMarkdownToHtml(markdownContent: string): Promise<string> {
  try {
    const file = await unified()
      .use(remarkParse) // Parse markdown
      .use(remarkGfm) // Support GFM (tables, strikethrough, etc.)
      .use(remarkMath) // Support math syntax
      .use(remarkEmoji) // Support emoji syntax like :joy:
      .use(remarkRehype, { allowDangerousHtml: true }) // Convert to Rehype (HTML AST), allow raw HTML
      .use(rehypeKatex) // Render math with KaTeX
      .use(rehypePrismPlus, { defaultLanguage: 'js', showLineNumbers: true }) // Code syntax highlighting
      .use(rehypeAutolinkHeadings, { // Add links to headings
        behavior: 'wrap', // or 'append'
        properties: { className: ['anchor'] }
      })
      .use(rehypeStringify, { allowDangerousHtml: true }) // Convert HTML AST to string
      .process(markdownContent);
    return String(file);
  } catch (error) {
    console.error("Error processing markdown:", error);
    return `<p>Error processing content. Please check the markdown syntax.</p>`;
  }
}


export default async function PostArticle({ post }: PostArticleProps) {
  if (!post) {
    return <div className="text-center py-10">No post data provided.</div>;
  }

  const processedContent = await processMarkdownToHtml(post.content);
  const formattedPublishDate = formatDate(post.publishDate);

  return (
    <article className="prose prose-base sm:prose-lg lg:prose-xl dark:prose-invert mx-auto p-4 sm:p-6 lg:p-8">
      {/* 
        CSS for KaTeX and PrismJS:
        Ensure these are imported globally, e.g., in src/app/globals.css or layout.tsx:
        import 'katex/dist/katex.min.css'; 
        import 'prism-themes/themes/prism-one-dark.css'; // Or your preferred Prism theme
        For line numbers with rehype-prism-plus, you might need additional CSS from 'prismjs/plugins/line-numbers/prism-line-numbers.css'
        and ensure your chosen theme supports them or add styles manually.
      */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3">
          {post.title || "Untitled Post"}
        </h1>
        {(post.category || formattedPublishDate) && (
          <div className="text-sm sm:text-base text-muted-foreground">
            {post.category && (
              <span className="font-medium">{post.category}</span>
            )}
            {post.category && formattedPublishDate && (
              <span className="mx-2">&bull;</span>
            )}
            {formattedPublishDate && (
              <time dateTime={formattedPublishDate}>{formattedPublishDate}</time>
            )}
          </div>
        )}
      </header>
      
      <div dangerouslySetInnerHTML={{ __html: processedContent }} />
    </article>
  );
}

// Example of how to provide props if using this component directly:
/*
const samplePostData: PostData = {
  title: "My Awesome Blog Post",
  content: `
# Hello World

This is a paragraph with **bold** and _italic_ text.

## Math Example
Inline math: $E = mc^2$

Block math:
$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

## Code Example
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet('Developer');
\`\`\`

## GFM Table
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

Emoji: :tada: :rocket:
  `,
  category: "Technology",
  publishDate: new Date().toISOString(), // Or a Firebase Timestamp
};
*/

// To use this component:
// <PostArticle post={samplePostData} />
// Or, if fetching data:
// const post = await getPostData(postId);
// return <PostArticle post={post} />;
