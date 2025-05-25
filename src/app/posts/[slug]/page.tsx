import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug } from '@/lib/firebase'; // Updated import
import { renderMarkdownToHTML } from '@/lib/markdown'; // Updated import
import type { PostDetail } from '@/types/post'; // Updated import
// import { getAllPosts } from '@/lib/firebase'; // For generateStaticParams
import { CalendarPlus, ClockClockwise } from '@/components/Icons'; // Adjusted import path
import { formatJpDate } from '@/lib/format'; // Adjusted import path
import SocialShareLinks from '@/components/SocialShareLinks';

const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return;

  return {
    title: post.title,
  };
};

interface PostPageProps {
  params: {
    slug: string;
  };
}

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
  const { contentHtml, frontmatterData } = await renderMarkdownToHTML(post.content);
  // Note: frontmatterData might be useful if you store metadata in Markdown frontmatter
  // For now, we primarily use data directly from Firestore fields like post.title, post.category.

  return (
    <article className='prose dark:prose-invert'>
      <header className='mb-6'>
        <h1 className='text-4xl mb-2'>{post.title}</h1>
        <div className='text-sm text-muted-foreground flex items-center'>
          <span><CalendarPlus className='inline-block w-5 h-5'/> <span className="ml-1">{formatJpDate(post.publishDate)}</span></span>
          {post.updateDate && (
            <span className='ml-4'>
              <ClockClockwise className='inline-block w-5 h-5'/> <span className="ml-1">{formatJpDate(post.updateDate)}</span>
            </span>
          )}
        </div>
        <div className='text-sm text-muted-foreground'>
          <span>
            カテゴリー：<span className='font-bold'>
              <Link href={`/categories/${encodeURIComponent(post.category.toLowerCase())}`} className='!text-muted-foreground'>
                {post.category}
              </Link>
            </span>
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
        className="max-w-none markdown-content" // Added .markdown-content
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {/* 
        The rehype-autolink-headings plugin (used in markdown.ts) should have already
        added anchor links to headings in contentHtml. Styling for these anchors
        can be done via CSS (e.g., targeting .anchor class if configured).
      */}

      <footer className='mt-12 pt-4 border-t text-sm'>
        <p className='text-muted-foreground'>この記事を共有する:</p>
        <SocialShareLinks title={post.title} />
      </footer>
    </article>
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
