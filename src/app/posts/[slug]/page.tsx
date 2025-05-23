import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/firebase'; // Updated import
import { renderMarkdownToHTML } from '@/lib/markdown'; // Updated import
import type { PostDetail } from '@/types/post'; // Updated import
// import { getAllPosts } from '@/lib/firebase'; // For generateStaticParams

interface PostPageProps {
  params: {
    slug: string;
  };
}

// This is a Server Component, so it can be async
const PostPage: React.FC<PostPageProps> = async ({ params }) => {
  const { slug } = params;
  const post: PostDetail | null = await getPostBySlug(slug);

  if (!post) {
    notFound(); // Renders the nearest not-found.tsx or a default Next.js 404 page
  }

  // Render Markdown to HTML
  // The content in Firestore is expected to be Markdown.
  const { contentHtml, frontmatterData } = await renderMarkdownToHTML(post.content);
  // Note: frontmatterData might be useful if you store metadata in Markdown frontmatter
  // For now, we primarily use data directly from Firestore fields like post.title, post.category.

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#111' }}>
          {post.title}
        </h1>
        <div style={{ fontSize: '0.9rem', color: '#555' }}>
          <span>Published on: {new Date(post.publishDate).toLocaleDateString()}</span>
          {post.updateDate && (
            <span style={{ marginLeft: '1rem' }}>
              Updated on: {new Date(post.updateDate).toLocaleDateString()}
            </span>
          )}
          <span style={{ marginLeft: '1rem' }}>
            Category: <span style={{ fontWeight: 'bold' }}>{post.category}</span>
          </span>
        </div>
      </header>

      {/* 
        Rendered HTML from Markdown.
        Source is Markdown from Firestore, processed by remark/rehype pipeline.
        If Markdown source is not fully trusted (e.g., user-generated content without strict sanitization),
        additional sanitization (e.g., using rehype-sanitize) would be crucial.
        For this blog, assuming content is admin-curated.
      */}
      <div
        className="prose lg:prose-xl max-w-none markdown-content" // Added .markdown-content
        style={{ lineHeight: '1.7', color: '#333' }} // Basic inline style as fallback
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {/* 
        The rehype-autolink-headings plugin (used in markdown.ts) should have already
        added anchor links to headings in contentHtml. Styling for these anchors
        can be done via CSS (e.g., targeting .anchor class if configured).
      */}

      <footer style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #eee', fontSize: '0.9rem', color: '#777' }}>
        <p>Thank you for reading!</p>
        {/* Placeholder for related posts or social sharing */}
      </footer>
    </article>
  );
};

export default PostPage;

// Optional: Generate static params for known slugs if using SSG with live data
// export async function generateStaticParams() {
//   const posts = await getAllPosts(); // Fetch all posts to get their slugs
//   return posts.map((post) => ({
//     slug: post.slug,
//   }));
// }
