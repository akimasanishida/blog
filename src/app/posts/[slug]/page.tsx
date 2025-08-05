import { notFound, redirect } from "next/navigation";
import { getPostBySlugUnfiltered } from "@/lib/firebase";
import type { Post } from "@/types/post";
import { renderMarkdownToHTML } from "@/lib/markdown";
import "katex/dist/katex.min.css";
import "prism-themes/themes/prism-one-dark.css";
import ArticleBody from "@/components/ArticleBody";
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebaseAdmin';

const isAuthenticated = async (): Promise<boolean> => {
  const session = cookies().get('session')?.value || '';
  if (!session) {
    return false;
  }
  try {
    await adminAuth.verifySessionCookie(session, true);
    return true;
  } catch (error) {
    return false;
  }
};

const generateMetadata = async ({ params }: { params: Promise<{ slug:string }> }) => {
  const { slug } = await params;
  const post = await getPostBySlugUnfiltered(slug);

  if (!post) return;

  // For private posts, avoid indexing by search engines
  const robots = post.isPublic ? {} : {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  };

  return {
    title: post.title,
    robots: robots,
  };
};

const PostPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const post: Post | null = await getPostBySlugUnfiltered(slug);

  if (!post) {
    notFound();
  }

  // Handle private posts
  if (!post.isPublic) {
    const authed = await isAuthenticated();
    if (!authed) {
      redirect('/login');
    }
  }

  const contentHtml = await renderMarkdownToHTML(post.content);

  // 日付を文字列化
  let publishDateStr: string | undefined = undefined;
  let updateDateStr: string | undefined = undefined;
  if (post.publishDate) {
    const { formatJpDateFromTimestamp } = await import("@/lib/format");
    publishDateStr = formatJpDateFromTimestamp(post.publishDate);
  }
  if (post.updateDate) {
    const { formatJpDateFromTimestamp } = await import("@/lib/format");
    updateDateStr = formatJpDateFromTimestamp(post.updateDate);
  }

  return (
    <ArticleBody
      title={post.title}
      contentHtml={contentHtml}
      publishDate={publishDateStr}
      updateDate={updateDateStr}
      category={post.category}
      showShareLinks={post.isPublic}
    />
  );
};

export default PostPage;
export { generateMetadata };
