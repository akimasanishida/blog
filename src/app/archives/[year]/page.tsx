import PostList from '@/components/PostList';
import { mockPosts, PostListItem } from '@/lib/mockData'; // Assuming mockData.ts is in src/lib

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

  const filteredPosts = mockPosts.filter(post => {
    const postDate = new Date(post.publishDate);
    return postDate.getFullYear() === year;
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
//   const years = new Set(mockPosts.map(post => new Date(post.publishDate).getFullYear()));
//   return Array.from(years).map(year => ({ year: year.toString() }));
// }
