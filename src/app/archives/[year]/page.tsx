import PostList from '@/components/PostList';
import { getAllPosts } from '@/lib/firebase'; // Path to firebase.ts
import type { PostListItem } from '@/types/post'; // Path to post types

interface YearlyArchivePageProps {
  params: {
    year: string;
  };
}

const YearlyArchivePage = async({ params }: { params: Promise<{ year: string }> }) => {
  const { year } = await params;

  const year_num = parseInt(year, 10);

  if (isNaN(year_num)) {
    // Or handle as a "not found" case, though Next.js routing should prevent this with valid number patterns
    return <p className="text-center text-destructive">Invalid year format.</p>;
  }

  const allPosts = await getAllPosts(); // Fetch all posts
  const filteredPosts = allPosts.filter(post => {
    // Assuming post.publishDate is an ISO string "YYYY-MM-DDTHH:mm:ss.sssZ"
    // or just "YYYY-MM-DD" which new Date() can parse.
    const postDate = new Date(post.publishDate);
    return postDate.getUTCFullYear() === year_num; // Use getUTCFullYear for consistency
  });

  return (
    <>
      <h1>
        アーカイブ：{year_num}年
      </h1>
      <PostList posts={filteredPosts} />
    </>
  );
};

export default YearlyArchivePage;

// Optional: For SSG, if you know all possible archive years
// export async function generateStaticParams() {
//   const allPosts = await getAllPosts();
//   const years = new Set(allPosts.map(post => new Date(post.publishDate).getUTCFullYear()));
//   return Array.from(years).map(year => ({ year: year.toString() }));
// }
