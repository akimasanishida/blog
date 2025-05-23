import { notFound } from 'next/navigation';

interface ArticleData {
  title: string;
  publishDate: string;
  updateDate?: string;
  category: string;
  content: string; // Simple HTML string for now
}

// Mock database/lookup for article data
const mockArticleDatabase: Record<string, ArticleData> = {
  'first-post': {
    title: 'My First Blog Post',
    publishDate: '2024-01-15',
    category: 'Technology',
    content: '<p>This is the article content for My First Blog Post.</p><h2>Understanding the Basics</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
  },
  'second-post-updated': {
    title: 'A Journey into Next.js',
    publishDate: '2024-02-10',
    updateDate: '2024-02-12',
    category: 'Web Development',
    content: '<p>Exploring the powerful features of Next.js.</p><h3>Server Components</h3><p>Next.js 13 introduced server components, which can significantly improve performance.</p><h3>App Router</h3><p>The App Router provides a new way to structure Next.js applications, leveraging shared layouts and nested routing.</p>',
  },
  'thoughts-on-ai': {
    title: 'The Future of AI',
    publishDate: '2024-03-01',
    category: 'Artificial Intelligence',
    content: '<p>Artificial Intelligence is rapidly evolving. This post discusses some potential future trends.</p><ul><li>AI in healthcare</li><li>Ethical considerations</li><li>Advancements in NLP</li></ul>',
  },
};

interface PostPageProps {
  params: {
    slug: string;
  };
}

const PostPage: React.FC<PostPageProps> = ({ params }) => {
  const { slug } = params;
  const article = mockArticleDatabase[slug];

  if (!article) {
    notFound(); // This will render the nearest not-found.tsx or a default Next.js 404 page
  }

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#111' }}>{article.title}</h1>
        <div style={{ fontSize: '0.9rem', color: '#555' }}>
          <span>Published on: {new Date(article.publishDate).toLocaleDateString()}</span>
          {article.updateDate && (
            <span style={{ marginLeft: '1rem' }}>
              Updated on: {new Date(article.updateDate).toLocaleDateString()}
            </span>
          )}
          <span style={{ marginLeft: '1rem' }}>
            Category: <span style={{ fontWeight: 'bold' }}>{article.category}</span>
          </span>
        </div>
      </header>

      {/* TODO: Replace dangerouslySetInnerHTML with proper Markdown rendering and sanitization */}
      <div
        style={{ lineHeight: '1.7', color: '#333' }}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* 
        Placeholder for Heading Anchor Links:
        Once Markdown is processed into HTML (e.g., using remark/rehype),
        we can parse the generated HTML to find headings (h1, h2, h3, etc.)
        and automatically add IDs to them. Then, client-side JavaScript
        can be used to create interactive anchor links (e.g., on hover or click)
        that update the URL hash, allowing users to share direct links to sections.
        Libraries like rehype-slug and rehype-autolink-headings can automate this.
      */}

      <footer style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #eee', fontSize: '0.9rem', color: '#777' }}>
        <p>Thank you for reading!</p>
        {/* Placeholder for related posts or social sharing */}
      </footer>
    </article>
  );
};

export default PostPage;

// Optional: Generate static params for known slugs if using SSG without dynamic fetch
// export async function generateStaticParams() {
//   return Object.keys(mockArticleDatabase).map((slug) => ({
//     slug,
//   }));
// }
