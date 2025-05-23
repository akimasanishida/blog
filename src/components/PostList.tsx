import Link from 'next/link';

export interface PostListItem {
  slug: string;
  title: string;
  publishDate: string; // Using string for simplicity, can be Date
  updateDate?: string; // Optional, using string
  category: string;
}

interface PostListProps {
  posts: PostListItem[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return <p style={{ textAlign: 'center', color: '#555' }}>No posts found.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {posts.map((post) => (
        <li key={post.slug} style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            <Link href={`/posts/${post.slug}`} style={{ textDecoration: 'none', color: '#0070f3' }}>
              {post.title}
            </Link>
          </h2>
          <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '0.5rem' }}>
            <span>Published on: {new Date(post.publishDate).toLocaleDateString()}</span>
            {post.updateDate && (
              <span style={{ marginLeft: '1rem' }}>
                Updated on: {new Date(post.updateDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#333' }}>
            Category: <span style={{ fontWeight: 'bold' }}>{post.category}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default PostList;
