import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/firebaseServer";
import type { Post } from "@/types/post";
import { renderMarkdownToHTML } from "@/lib/markdown";
import "katex/dist/katex.min.css";
import "prism-themes/themes/prism-one-dark.css";
import ArticleBody from "@/components/ArticleBody";

const generateMetadata = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return;

  return {
    title: post.title,
  };
};

const PostPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const post: Post | null = await getPostBySlug(slug);

  if (!post) {
    notFound();
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
      showShareLinks={true}
    />
  );
};

export default PostPage;
export { generateMetadata };
