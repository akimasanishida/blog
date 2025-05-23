import PostList from '@/components/PostList';
import { getAllPosts } from '@/lib/firebase'; // Path to firebase.ts
import type { PostListItem } from '@/types/post'; // Path to post types

interface CategoryPageProps {
  params: {
    category: string; // This will be URL-encoded
  };
}

const CategoryPage: React.FC<CategoryPageProps> = async ({ params }) => {
  // Decode the category name from the URL (e.g., "Web%20Development" -> "Web Development")
  const decodedCategory = decodeURIComponent(params.category);

  const allPosts = await getAllPosts(); // Fetch all posts
  const filteredPosts = allPosts.filter(post => 
    post.category.toLowerCase() === decodedCategory.toLowerCase()
  );

  // Capitalize the first letter of each word in the category for display
  const displayCategoryName = decodedCategory.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ textAlign: 'center', margin: '2rem 0', fontSize: '2.5rem' }}>
        Category: {displayCategoryName}
      </h1>
      <PostList posts={filteredPosts} />
    </div>
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
