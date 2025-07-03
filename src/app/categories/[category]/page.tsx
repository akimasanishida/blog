import PostList from '@/components/PostList';
import PaginationControls from '@/components/PaginationControls';
import { getAllPosts } from '@/lib/firebase';
import { paginatePost, NUM_PAGINATION } from '@/lib/pagination';
import type { Post } from '@/types/post';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: { category: string }; // Expect params to be resolved
  searchParams?: {
    page?: string;
  };
}

export async function generateMetadata(
  { params, searchParams }: CategoryPageProps
): Promise<Metadata> {
  // Category from URL might be URL-encoded (e.g., "web%20development")
  // Decode it for display purposes.
  const decodedCategory = decodeURIComponent(params.category);
  const page = parseInt(searchParams?.page || '1', 10);
  const pageSuffix = page > 1 ? ` (${page}ページ目)` : '';
  // Capitalize first letter for title
  const displayCategory = decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1);
  const title = `${displayCategory} カテゴリー${pageSuffix}`;
  const description = `${displayCategory} カテゴリーの投稿一覧${pageSuffix}`;

  return {
    title,
    description,
  };
}

const CategoryPage = async ({ params, searchParams }: CategoryPageProps) => {
  // The category from params might be URL-encoded.
  const categoryFromParams = params.category;
  const currentPage = parseInt(searchParams?.page || '1', 10);

  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  const allPosts: Post[] = await getAllPosts();
  // When filtering, compare with the URL-decoded category from params,
  // and also decode the post.category if it might also contain encoded entities.
  // However, Firestore data `post.category` is likely not URL-encoded.
  // The comparison should be case-insensitive and handle decoded URI components.
  const decodedCategoryFromParams = decodeURIComponent(categoryFromParams.toLowerCase());

  const postsForCategory = allPosts.filter(post => {
    // Assuming post.category is stored as a plain string, not URL encoded.
    // Normalize both to lowercase for comparison.
    return post.category?.toLowerCase() === decodedCategoryFromParams;
  });

  const totalPosts = postsForCategory.length;
  const totalPages = Math.ceil(totalPosts / NUM_PAGINATION);

  if (totalPosts > 0 && currentPage > totalPages) {
    notFound();
  }

  if (totalPosts === 0 && currentPage > 1) {
      notFound();
  }

  const postsForPage = paginatePost(postsForCategory, currentPage);

  if (!postsForPage && currentPage > 1 && totalPosts > 0) {
    notFound();
  }

  // For display, use the decoded category, capitalized.
  const displayCategory = decodeURIComponent(categoryFromParams);
  const capitalizedDisplayCategory = displayCategory.charAt(0).toUpperCase() + displayCategory.slice(1);
  const pageTitle = `カテゴリー：${capitalizedDisplayCategory}${currentPage > 1 ? ` (${currentPage}ページ目)` : ''}`;

  return (
    <>
      <h1>{pageTitle}</h1>
      {postsForPage && postsForPage.length > 0 ? (
        <PostList posts={postsForPage} />
      ) : (
        <p className="text-center text-muted-foreground">このカテゴリーにはまだ投稿がありません。</p>
      )}
      {totalPosts > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/categories/${categoryFromParams}`} // Use original param for basePath to preserve encoding
        />
      )}
    </>
  );
};

export default CategoryPage;

// Optional: For SSG, if you know all possible categories
// export async function generateStaticParams() {
//   const allPosts = await getAllPosts();
//   const categories = new Set(
//     allPosts
//       .map(post => post.category?.toLowerCase())
//       .filter(Boolean) as string[] // Ensure category exists and filter out undefined
//   );
//   return Array.from(categories).map(category => ({ 
//     // URL-encode the category slug for the path
//     category: encodeURIComponent(category) 
//   }));
// }
