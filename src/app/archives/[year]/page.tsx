import PostList from '@/components/PostList';
import PaginationControls from '@/components/PaginationControls';
import { getAllPosts } from '@/lib/firebase';
import { paginatePost, NUM_PAGINATION } from '@/lib/pagination';
import type { Post } from '@/types/post';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface YearlyArchivePageProps {
  params: { year: string }; // Expect params to be resolved
  searchParams?: {
    page?: string;
  };
}

export async function generateMetadata({
  params, searchParams
}: {
  params: Promise<YearlyArchivePageProps['params']>,
  searchParams?: Promise<YearlyArchivePageProps['searchParams']>
}): Promise<Metadata> {
  const year = (await params).year;
  const page = parseInt((await searchParams)?.page || '1', 10);
  const pageSuffix = page > 1 ? ` (${page}ページ目)` : '';
  const title = `ブログアーカイブ（${year}年）${pageSuffix}`;
  const description = `${year}年の投稿一覧${pageSuffix}`;

  return {
    title,
    description,
  };
}

const YearlyArchivePage = async ({
  params, searchParams
}: {
  params: Promise<YearlyArchivePageProps['params']>,
  searchParams?: Promise<YearlyArchivePageProps['searchParams']>
}) => {
  const { year } = await params;
  const { page } = await searchParams || {};
  const currentPage = parseInt(page || '1', 10);

  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum)) {
    notFound(); // Invalid year format
  }

  const allPosts: Post[] = await getAllPosts();
  const postsForYear = allPosts.filter(post => {
    const postDate = post.publishDate?.toDate();
    return postDate?.getUTCFullYear() === yearNum;
  });

  if (postsForYear.length === 0) {
    // If no posts for this year, it could be a 404, or just display a message
    // Depending on requirements, for now, we'll show a message but still allow pagination controls if page=1 (empty)
    // Or, strictly, if no posts, then any page > 0 is notFound.
    // For simplicity, if no posts for the year, any page requested will lead to "no posts" message.
    // A more robust approach might be to notFound() if postsForYear.length === 0 and currentPage > 1
  }

  const totalPosts = postsForYear.length;
  const totalPages = Math.ceil(totalPosts / NUM_PAGINATION);

  if (totalPosts > 0 && currentPage > totalPages) {
    notFound();
  }

  // Also handle if currentPage is 1 but totalPosts is 0
  if (totalPosts === 0 && currentPage > 1) {
      notFound();
  }


  const postsForPage = paginatePost(postsForYear, currentPage);

  // if (!postsForPage && totalPosts > 0) {
  //   // This check is important if paginatePost could return undefined for valid currentPages
  //   // (e.g. if postsForYear is empty and currentPage is 1, paginatePost might return undefined or [])
  //   // Given current paginatePost, if postsForYear is empty, it returns undefined.
  //   // If postsForYear has items but currentPage is out of bound, it returns undefined.
  //   notFound();
  // }

  // If postsForYear is empty, postsForPage will be undefined from paginatePost.
  // We want to show "no posts" rather than 404 if it's page 1 of an existing year with no posts.
  if (!postsForPage && currentPage > 1 && totalPosts > 0) {
    notFound();
  }


  const pageTitle = `アーカイブ：${yearNum}年${currentPage > 1 ? ` (${currentPage}ページ目)` : ''}`;

  return (
    <>
      <h1>{pageTitle}</h1>
      {postsForPage && postsForPage.length > 0 ? (
        <PostList posts={postsForPage} />
      ) : (
        <p className="text-center text-muted-foreground">この年にはまだ投稿がありません。</p>
      )}
      {totalPosts > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/archives/${yearNum}`}
        />
      )}
    </>
  );
};

export default YearlyArchivePage;

// Optional: For SSG, if you know all possible archive years
// export async function generateStaticParams() {
//   const allPosts = await getAllPosts();
//   const years = new Set(allPosts.map(post => post.publishDate?.toDate().getUTCFullYear()));
//   // Filter out undefined if any post.publishDate is missing
//   return Array.from(years).filter(year => year !== undefined).map(year => ({ year: year!.toString() }));
// }
