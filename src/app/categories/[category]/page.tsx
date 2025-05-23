import PostList from '@/components/PostList';
import { mockPosts, PostListItem } from '@/lib/mockData'; // Using mockData from src/lib

interface CategoryPageProps {
  params: {
    category: string; // This will be URL-encoded
  };
}

const CategoryPage: React.FC<CategoryPageProps> = ({ params }) => {
  // Decode the category name from the URL (e.g., "Web%20Development" -> "Web Development")
  const decodedCategory = decodeURIComponent(params.category);

  const filteredPosts = mockPosts.filter(post => 
    post.category.toLowerCase() === decodedCategory.toLowerCase()
  );

  // Capitalize the first letter of each word in the category for display, if desired
  // For simplicity, we'll use the decodedCategory as is for the title, 
  // but one might want to format it more nicely (e.g. "Web development" -> "Web Development")
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
//   const categories = new Set(mockPosts.map(post => post.category.toLowerCase()));
//   return Array.from(categories).map(category => ({ 
//     // URL-encode the category slug if it contains spaces or special characters
//     category: encodeURIComponent(category) 
//   }));
// }
