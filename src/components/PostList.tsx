import Link from 'next/link';
import type { PostListItem } from '../types/post'; // Adjusted path
import { CalendarPlus, ClockClockwise } from "@/components/Icons"; // Adjusted import path
import { formatJpDate } from '@/lib/format';

interface PostListProps {
  posts: PostListItem[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return <p className="text-center text-muted-foreground">No posts found.</p>;
  }

  return (
    <ul className="list-none p-0">
      {posts.map((post) => (
        <li key={post.slug} className="mb-8 pb-4 border-b border-border">
          <h2 className="text-2xl mb-2">
            <Link href={`/posts/${post.slug}`} className='link-no-underline'>
              {post.title}
            </Link>
          </h2>
          <div className="text-sm text-muted-foreground flex items-center">
            <CalendarPlus className='inline-block w-5 h-5'/> <span className="ml-1">{formatJpDate(post.publishDate)}</span>
            {post.updateDate && (
              <span className="ml-4">
                <ClockClockwise className='inline-block w-5 h-5'/> <span className="ml-1">{formatJpDate(post.updateDate)}</span>
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            カテゴリー：<span className="font-bold">
              <Link href={`/categories/${encodeURIComponent(post.category.toLowerCase())}`} className='!text-muted-foreground'>
              {post.category}
            </Link>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default PostList;
