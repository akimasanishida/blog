import PostList from '@/components/PostList';
import { getAllPosts } from '@/lib/firebase'; // Path to firebase.ts
import type { PostListItem } from '@/types/post'; // Path to post types

// This page needs to be an async component to fetch data
export default async function Home() {
  const posts: PostListItem[] = await getAllPosts();

  return (
    <>
      <h1 className="text-center my-8 text-[2.5rem]">
        Recent Posts
      </h1>
      <PostList posts={posts} />
    </>
  );
}
