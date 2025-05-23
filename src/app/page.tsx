import PostList, { PostListItem } from '@/components/PostList';

const mockPosts: PostListItem[] = [
  {
    slug: 'first-post',
    title: 'My First Blog Post',
    publishDate: '2024-01-15',
    category: 'Technology',
  },
  {
    slug: 'second-post-updated',
    title: 'A Journey into Next.js',
    publishDate: '2024-02-10',
    updateDate: '2024-02-12',
    category: 'Web Development',
  },
  {
    slug: 'thoughts-on-ai',
    title: 'The Future of AI',
    publishDate: '2024-03-01',
    category: 'Artificial Intelligence',
  },
];

export default function Home() {
  return (
    // The main content for the home page will be rendered here.
    // Header and Footer are handled by src/app/layout.tsx
    // The <main> tag with flex properties is already in layout.tsx
    <>
      <h1 style={{ textAlign: 'center', margin: '2rem 0', fontSize: '2.5rem' }}>
        Recent Posts
      </h1>
      <PostList posts={mockPosts} />
    </>
  );
}
