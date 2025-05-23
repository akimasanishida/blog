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
import matter from 'gray-matter'; // For frontmatter parsing

interface MarkdownResult {
  contentHtml: string;
  frontmatterData?: { [key: string]: any };
}

/**
 * Renders Markdown content to HTML with various plugins.
 * @param markdownContent The raw Markdown string.
 * @returns An object containing the rendered HTML and extracted frontmatter data.
 */
export const renderMarkdownToHTML = async (markdownContent: string): Promise<MarkdownResult> => {
  // 1. Parse frontmatter
  const { content: markdownWithoutFrontmatter, data: frontmatterData } = matter(markdownContent);

  // 2. Process Markdown to HTML
  const processor = unified()
    .use(remarkParse)                     // Parse Markdown
    .use(remarkGfm)                       // GitHub Flavored Markdown
    .use(remarkMath)                      // Math syntax (e.g., $E=mc^2$)
    .use(remarkEmoji)                     // Emoji (e.g., :tada:)
    .use(remarkRehype, { allowDangerousHtml: true }) // Convert to Rehype (HTML AST)
                                          // allowDangerousHtml: true only if source is trusted
    .use(rehypeKatex)                     // Render math with KaTeX
    .use(rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }) // Code syntax highlighting
    .use(rehypeAutolinkHeadings, {         // Add self-links to headings
      behavior: 'wrap', // or 'append', 'prepend'
      properties: {
        className: ['anchor'], // Optional: class for styling the link
      },
    })
    .use(rehypeStringify);                // Convert HTML AST to string

  const result = await processor.process(markdownWithoutFrontmatter);
  const contentHtml = result.toString();

  return {
    contentHtml,
    frontmatterData,
  };
};

// Example Usage (can be removed or kept for testing)
// (async () => {
//   const markdown = `
// ---
// title: Test Post
// date: 2024-03-21
// ---
// # Hello World
// This is a test paragraph with some *emphasis* and **bold** text.
// And a :tada: emoji!
//
// ## Math
// Inline math: $E = mc^2$
// Display math:
// $$
// \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
// $$
//
// ## Code Block (JavaScript)
// \`\`\`javascript
// function greet(name) {
//   console.log(\`Hello, \${name}!\`);
// }
// greet('Developer');
// \`\`\`
//   `;
//   try {
//     const { contentHtml, frontmatterData } = await renderMarkdownToHTML(markdown);
//     console.log('Frontmatter:', frontmatterData);
//     console.log('Rendered HTML:', contentHtml);
//   } catch (error) {
//     console.error('Error rendering markdown:', error);
//   }
// })();
