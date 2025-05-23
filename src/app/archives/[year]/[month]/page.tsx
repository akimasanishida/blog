import PostList from '@/components/PostList';
import { getAllPosts } from '@/lib/firebase'; // Path to firebase.ts
import type { PostListItem } from '@/types/post'; // Path to post types

interface MonthlyArchivePageProps {
  params: {
    year: string;
    month: string;
  };
}

const getMonthName = (monthNumber: number): string => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[monthNumber - 1] || "Invalid Month"; // monthNumber is 1-12
};

const MonthlyArchivePage: React.FC<MonthlyArchivePageProps> = ({ params }) => {
  const year = parseInt(params.year, 10);
  const month = parseInt(params.month, 10); // This will be 1-12 from URL

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    // Or handle as a "not found" case
    return <p style={{ textAlign: 'center', color: 'red' }}>Invalid year or month format.</p>;
  }

  const allPosts = await getAllPosts(); // Fetch all posts
  const filteredPosts = allPosts.filter(post => {
    const postDate = new Date(post.publishDate);
    // JavaScript Date months are 0-indexed (0 for Jan, 11 for Dec)
    // So, compare postDate.getUTCMonth() + 1 with the URL month
    return postDate.getUTCFullYear() === year && (postDate.getUTCMonth() + 1) === month;
  });

  const monthName = getMonthName(month);

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ textAlign: 'center', margin: '2rem 0', fontSize: '2.5rem' }}>
        Archives: {monthName} {year}
      </h1>
      <PostList posts={filteredPosts} />
    </div>
  );
};

export default MonthlyArchivePage;

// Optional: For SSG, if you know all possible archive year/month combinations
// export async function generateStaticParams() {
//   const allPosts = await getAllPosts();
//   const yearMonthCombinations = new Set(
//     allPosts.map(post => {
//       const date = new Date(post.publishDate);
//       return `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}`; // month +1 for 1-indexed
//     })
//   );
//   return Array.from(yearMonthCombinations).map(ym => {
//     const [year, month] = ym.split('/');
//     return { year, month };
//   });
// }
