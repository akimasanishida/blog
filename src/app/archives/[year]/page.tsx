import PostList from '@/components/PostList';
import { getAllPosts } from '@/lib/firebase'; // Path to firebase.ts
import type { PostListItem } from '@/types/post'; // Path to post types

interface YearlyArchivePageProps {
  params: {
    year: string;
  };
}

const YearlyArchivePage: React.FC<YearlyArchivePageProps> = ({ params }) => {
  const year = parseInt(params.year, 10);

  if (isNaN(year)) {
    // Or handle as a "not found" case, though Next.js routing should prevent this with valid number patterns
    return <p style={{ textAlign: 'center', color: 'red' }}>Invalid year format.</p>;
  }

  const allPosts = await getAllPosts(); // Fetch all posts
  const filteredPosts = allPosts.filter(post => {
    // Assuming post.publishDate is an ISO string "YYYY-MM-DDTHH:mm:ss.sssZ"
    // or just "YYYY-MM-DD" which new Date() can parse.
    const postDate = new Date(post.publishDate);
    return postDate.getUTCFullYear() === year; // Use getUTCFullYear for consistency
  });

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ textAlign: 'center', margin: '2rem 0', fontSize: '2.5rem' }}>
        Archives: {year}
      </h1>
      <PostList posts={filteredPosts} />
    </div>
  );
};

export default YearlyArchivePage;

// Optional: For SSG, if you know all possible archive years
// export async function generateStaticParams() {
//   const allPosts = await getAllPosts();
//   const years = new Set(allPosts.map(post => new Date(post.publishDate).getUTCFullYear()));
//   return Array.from(years).map(year => ({ year: year.toString() }));
// }
