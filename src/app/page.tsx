import PostList from '@/components/PostList';
import PaginationControls from '@/components/PaginationControls';
import { getAllPosts } from '@/lib/firebase';
import { paginatePost, NUM_PAGINATION } from '@/lib/pagination';
import type { Post } from '@/types/post';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface HomePageProps {
  searchParams?: {
    page?: string;
  };
}

export async function generateMetadata(
  { searchParams }: HomePageProps
): Promise<Metadata> {
  const page = parseInt(searchParams?.page || '1', 10);
  const title = `西田明正のブログ${page > 1 ? ` (${page}ページ目)` : ''}`;
  // TODO: Add description and other metadata fields as needed
  return {
    title,
  };
}

export default async function Home({ searchParams }: HomePageProps) {
  const currentPage = parseInt(searchParams?.page || '1', 10);
  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  const allPosts: Post[] = await getAllPosts();
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / NUM_PAGINATION);

  if (totalPosts > 0 && currentPage > totalPages) {
    notFound();
  }

  const postsForPage = paginatePost(allPosts, currentPage);

  if (!postsForPage && totalPosts > 0) {
    // This case should ideally be caught by currentPage > totalPages,
    // but as a safeguard if paginatePost returns undefined for other reasons.
    notFound();
  }

  const pageTitle = `投稿一覧${currentPage > 1 ? ` (${currentPage}ページ目)` : ''}`;

  return (
    <>
      <h1>{pageTitle}</h1>
      {postsForPage && postsForPage.length > 0 ? (
        <PostList posts={postsForPage} />
      ) : (
        <p className="text-center text-muted-foreground">表示する投稿がありません。</p>
      )}
      {totalPosts > 0 && (
         <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/"
          />
      )}
    </>
  );
}
