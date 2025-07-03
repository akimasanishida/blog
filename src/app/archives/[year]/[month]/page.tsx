import PostList from '@/components/PostList';
import PaginationControls from '@/components/PaginationControls';
import { getAllPosts } from '@/lib/firebase';
import { paginatePost, NUM_PAGINATION } from '@/lib/pagination';
import type { Post } from '@/types/post';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface MonthlyArchivePageProps {
  params: { year: string; month: string }; // Expect params to be resolved
  searchParams?: {
    page?: string;
  };
}

export async function generateMetadata(
  { params, searchParams }: MonthlyArchivePageProps
): Promise<Metadata> {
  const { year, month } = params;
  const displayMonth = String(Number(month)); // Ensure month is displayed correctly, e.g., "07" -> "7"
  const page = parseInt(searchParams?.page || '1', 10);
  const pageSuffix = page > 1 ? ` (${page}ページ目)` : '';
  const title = `ブログアーカイブ（${year}年${displayMonth}月）${pageSuffix}`;
  const description = `${year}年${displayMonth}月の投稿一覧${pageSuffix}`;

  return {
    title,
    description,
  };
}

const MonthlyArchivePage = async ({ params, searchParams }: MonthlyArchivePageProps) => {
  const { year, month } = params;
  const currentPage = parseInt(searchParams?.page || '1', 10);

  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10); // This will be 1-12 from URL

  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    notFound(); // Invalid year or month format
  }

  const allPosts: Post[] = await getAllPosts();
  const postsForMonth = allPosts.filter(post => {
    const postDate = post.publishDate?.toDate();
    // JavaScript Date months are 0-indexed (0 for Jan, 11 for Dec)
    return postDate?.getUTCFullYear() === yearNum && (postDate.getUTCMonth() + 1) === monthNum;
  });

  const totalPosts = postsForMonth.length;
  const totalPages = Math.ceil(totalPosts / NUM_PAGINATION);

  if (totalPosts > 0 && currentPage > totalPages) {
    notFound();
  }

  if (totalPosts === 0 && currentPage > 1) {
      notFound();
  }

  const postsForPage = paginatePost(postsForMonth, currentPage);

  if (!postsForPage && currentPage > 1 && totalPosts > 0) {
    notFound();
  }

  const displayMonth = String(monthNum); // For display in title
  const pageTitle = `アーカイブ：${yearNum}年${displayMonth}月${currentPage > 1 ? ` (${currentPage}ページ目)` : ''}`;

  return (
    <>
      <h1>{pageTitle}</h1>
      {postsForPage && postsForPage.length > 0 ? (
        <PostList posts={postsForPage} />
      ) : (
        <p className="text-center text-muted-foreground">この月にはまだ投稿がありません。</p>
      )}
      {totalPosts > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/archives/${yearNum}/${monthNum}`}
        />
      )}
    </>
  );
};

export default MonthlyArchivePage;

// Optional: For SSG, if you know all possible archive year/month combinations
// export async function generateStaticParams() {
//   const allPosts = await getAllPosts();
//   const yearMonthCombinations = new Set(
//     allPosts.map(post => {
//       const date = post.publishDate?.toDate();
//       if (!date) return null; // Handle cases where publishDate might be undefined
//       return `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, '0')}`; // month +1, pad for URL consistency if needed
//     })
//   );
//   return Array.from(yearMonthCombinations)
//     .filter(Boolean) // Remove nulls
//     .map(ym => {
//       const [year, month] = ym!.split('/');
//       return { year, month };
//     });
// }
