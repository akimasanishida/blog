import PostList from '@/components/PostList';
import { getAllPosts } from '@/lib/firebase'; // Path to firebase.ts
import type { PostListItem } from '@/types/post'; // Path to post types

interface CategoryPageProps {
  params: {
    category: string; // This will be URL-encoded
  };
}

const CategoryPage = async ({ params }: {
  params: Promise<{ category: string }>;
}) => {
  const { category } = await params; // Await the promise to get the actual values

  const allPosts = await getAllPosts(); // Fetch all posts
  const filteredPosts = allPosts.filter(post => 
    post.category.toLowerCase() === category.toLowerCase()
  );

  return (
    <>
      <h1>
        カテゴリー：{category}
      </h1>
      <PostList posts={filteredPosts} />
    </>
  );
};

export default CategoryPage;

// Optional: For SSG, if you know all possible categories
// export async function generateStaticParams() {
//   const allPosts = await getAllPosts();
//   const categories = new Set(allPosts.map(post => post.category.toLowerCase()));
//   return Array.from(categories).map(category => ({ 
//     // URL-encode the category slug if it contains spaces or special characters
//     category: encodeURIComponent(category) 
//   }));
// }
