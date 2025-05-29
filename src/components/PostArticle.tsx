// src/components/PostArticle.tsx
// 'use server'; // Removed to fix "Server Actions must be async functions" with sync component

// import { unified } from 'unified'; // Commented out for diagnostic
// import remarkParse from 'remark-parse'; // Commented out for diagnostic
// import remarkGfm from 'remark-gfm'; // Commented out for diagnostic
// import remarkMath from 'remark-math'; // Commented out for diagnostic
// import remarkEmoji from 'remark-emoji'; // Commented out for diagnostic
// import remarkRehype from 'remark-rehype'; // Commented out for diagnostic
// import rehypeKatex from 'rehype-katex'; // Commented out for diagnostic
// import rehypePrismPlus from 'rehype-prism-plus'; // Commented out for diagnostic
// import rehypeAutolinkHeadings from 'rehype-autolink-headings'; // Commented out for diagnostic
// import rehypeStringify from 'rehype-stringify'; // Commented out for diagnostic
import { Timestamp } from 'firebase/firestore'; // For publishDate type - kept for PostData interface

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
// const formatDate = (dateInput: Date | Timestamp | string | undefined): string | null => { // Commented out, not used in simplified version
//   if (!dateInput) return null;

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
// };

// Asynchronous function to process markdown content to HTML - Commented out for diagnostic
// async function processMarkdownToHtml(markdownContent: string): Promise<string> {
//   try {
//     const file = await unified()
//       .use(remarkParse) // Parse markdown
//       .use(remarkGfm) // Support GFM (tables, strikethrough, etc.)
//       .use(remarkMath) // Support math syntax
//       .use(remarkEmoji) // Support emoji syntax like :joy:
//       .use(remarkRehype, { allowDangerousHtml: true }) // Convert to Rehype (HTML AST), allow raw HTML
//       .use(rehypeKatex) // Render math with KaTeX
//       .use(rehypePrismPlus, { defaultLanguage: 'js', showLineNumbers: true }) // Code syntax highlighting
//       .use(rehypeAutolinkHeadings, { // Add links to headings
//         behavior: 'wrap', // or 'append'
//         properties: { className: ['anchor'] }
//       })
//       .use(rehypeStringify, { allowDangerousHtml: true }) // Convert HTML AST to string
//       .process(markdownContent);
//     return String(file);
//   } catch (error) {
//     console.error("Error processing markdown:", error);
//     return `<p>Error processing content. Please check the markdown syntax.</p>`;
//   }
// }


// Changed to a synchronous component for diagnostic purposes
export default function PostArticle({ post }: PostArticleProps) {
  if (!post) {
    return (
      <div className="text-center py-10">
        <p>No post data provided to PostArticle (Simplified).</p>
      </div>
    );
  }

  // const formattedPublishDate = formatDate(post.publishDate); // Commented out

  return (
    <article className="prose prose-base sm:prose-lg lg:prose-xl dark:prose-invert mx-auto p-4 sm:p-6 lg:p-8">
      {/* Minimal static JSX for diagnostics */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3">
          {post.title || "Static Title from Simplified PostArticle"}
        </h1>
        {/* {(post.category || formattedPublishDate) && ( // Commented out category/date display
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
        )} */}
         <p className="text-sm text-muted-foreground">Category: {post.category || "N/A"} | Date: {post.publishDate ? String(post.publishDate) : "N/A"}</p>
      </header>
      
      <div>
        <p>This is a minimal, synchronous render from the simplified PostArticle component.</p>
        <h2 className="text-xl font-semibold mt-4 mb-2">Raw Content Prop:</h2>
        <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
          <code>
            {post.content || "No content prop provided."}
          </code>
        </pre>
      </div>
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
