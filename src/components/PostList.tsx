import Link from 'next/link';
import type { PostListItem } from '../types/post'; // Adjusted path

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
          <div className="text-sm text-muted-foreground mb-2">
            <span>Published on: {new Date(post.publishDate).toLocaleDateString()}</span>
            {post.updateDate && (
              <span className="ml-4">
                Updated on: {new Date(post.updateDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="text-sm text-foreground">
            Category: <span className="font-bold">{post.category}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default PostList;
