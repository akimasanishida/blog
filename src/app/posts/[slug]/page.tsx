import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/firebase'; // Updated import
import { renderMarkdownToHTML } from '@/lib/markdown'; // Updated import
import type { PostDetail } from '@/types/post'; // Updated import
// import { getAllPosts } from '@/lib/firebase'; // For generateStaticParams
import 'katex/dist/katex.min.css';
import 'prism-themes/themes/prism-one-dark.css';
import ArticleBody from '@/components/ArticleBody';

const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return;

  return {
    title: post.title,
  };
};

// This is a Server Component, so it can be async
const PostPage = async ({ params }: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params;
  const post: PostDetail | null = await getPostBySlug(slug);

  if (!post) {
    notFound(); // Renders the nearest not-found.tsx or a default Next.js 404 page
  }

  // Render Markdown to HTML
  // The content in Firestore is expected to be Markdown.
  const { contentHtml } = await renderMarkdownToHTML(post.content);
  // Note: frontmatterData might be useful if you store metadata in Markdown frontmatter
  // For now, we primarily use data directly from Firestore fields like post.title, post.category.

  return (
    <ArticleBody
      title={post.title}
      contentHtml={contentHtml}
      category={post.category}
      publishDate={post.publishDate}
      updateDate={post.updateDate}
      showCategoryLink={true}
      showShareLinks={true}
    />
  );
};

export default PostPage;
export { generateMetadata };

// Optional: Generate static params for known slugs if using SSG with live data
// export async function generateStaticParams() {
//   const posts = await getAllPosts(); // Fetch all posts to get their slugs
//   return posts.map((post) => ({
//     slug: post.slug,
//   }));
// }
