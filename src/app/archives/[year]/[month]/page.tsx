import PostList from '@/components/PostList';
import { getAllPosts } from '@/lib/firebase'; // Path to firebase.ts

const generateMetadata = async ({
  params,
}: {
  params: Promise<{ year: string, month: string }>;
}) => {
  const { year, month } = await params;
  const displayMonth = String(Number(month))

  return {
    title: `ブログアーカイブ（${year}年${displayMonth}月）`,
    description: `${year}年${displayMonth}月の投稿一覧`,
  };
};

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

const MonthlyArchivePage = async ({ params }: {
  params: Promise<{ year: string; month: string }>,
}) => {
  const { year, month } = await params; // Await the promise to get the actual values
  const year_num = parseInt(year, 10);
  const month_num = parseInt(month, 10); // This will be 1-12 from URL

  if (isNaN(year_num) || isNaN(month_num) || month_num < 1 || month_num > 12) {
    // Or handle as a "not found" case
    return <p style={{ textAlign: 'center', color: 'red' }}>Invalid year or month format.</p>;
  }

  const allPosts = await getAllPosts(); // Fetch all posts
  const filteredPosts = allPosts.filter(post => {
    const postDate = new Date(post.publishDate);
    // JavaScript Date months are 0-indexed (0 for Jan, 11 for Dec)
    // So, compare postDate.getUTCMonth() + 1 with the URL month
    return postDate.getUTCFullYear() === year_num && (postDate.getUTCMonth() + 1) === month_num;
  });

  return (
    <>
      <h1>
        アーカイブ：{year_num}年{month_num}月
      </h1>
      <PostList posts={filteredPosts} />
    </>
  );
};

export default MonthlyArchivePage;
export { generateMetadata };

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
