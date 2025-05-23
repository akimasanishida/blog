// src/lib/mockData.ts

// PostListItem is what's needed for lists (e.g., homepage, archive pages)
export interface PostListItem {
  slug: string;
  title: string;
  publishDate: string; // ISO 8601 string (e.g., "2024-01-15T10:00:00.000Z" or "2024-01-15")
                       // We'll keep "YYYY-MM-DD" for mock data simplicity, but Firestore Timestamps would convert to full ISO strings.
  updateDate?: string; // ISO 8601 string or "YYYY-MM-DD"
  category: string;
  // tags?: string[]; // For future use, if fetched for list items
}

// PostDetail includes all data for a single post page, including content
export interface PostDetail extends PostListItem {
  content: string; // Markdown content
  // Potentially other fields like author, full metadata etc.
}

// Extended mockPosts to include 'content' for getPostBySlug simulation
export const mockPosts: PostDetail[] = [
  {
    slug: 'first-post',
    title: 'My First Blog Post',
    publishDate: '2024-01-15',
    category: 'Technology',
    content: '<p>This is the article content for My First Blog Post.</p><h2>Understanding the Basics</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
  },
  {
    slug: 'second-post-updated',
    title: 'A Journey into Next.js',
    publishDate: '2024-02-10',
    updateDate: '2024-02-12',
    category: 'Web Development',
    content: '<p>Exploring the powerful features of Next.js.</p><h3>Server Components</h3><p>Next.js 13 introduced server components, which can significantly improve performance.</p><h3>App Router</h3><p>The App Router provides a new way to structure Next.js applications, leveraging shared layouts and nested routing.</p>',
  },
  {
    slug: 'thoughts-on-ai',
    title: 'The Future of AI',
    publishDate: '2024-03-01',
    category: 'Artificial Intelligence',
    content: '<p>Artificial Intelligence is rapidly evolving. This post discusses some potential future trends.</p><ul><li>AI in healthcare</li><li>Ethical considerations</li><li>Advancements in NLP</li></ul>',
  },
  {
    slug: 'old-post-2023',
    title: 'A Look Back at 2023',
    publishDate: '2023-12-20',
    category: 'Reflection',
    content: '<p>Content for the 2023 reflection post.</p>',
  },
  {
    slug: 'another-post-2023-jan',
    title: 'New Year Resolutions 2023',
    publishDate: '2023-01-05',
    category: 'Personal',
    content: '<p>Content for new year resolutions 2023.</p>',
  },
  {
    slug: 'tech-trends-2023',
    title: 'Tech Trends in 2023',
    publishDate: '2023-02-28',
    category: 'Technology',
    content: '<p>Content for tech trends in 2023.</p>',
  }
];

// Function to simulate stripping content for PostListItem, if needed,
// or ensure mockPosts only contains PostListItem fields if getAllPosts strictly returns PostListItem[]
// For this simulation, getAllPosts can return PostDetail[] and components can pick what they need,
// or it can map to PostListItem. Let's map it for closer simulation.

export const getMockPostListItems = (): PostListItem[] => {
  return mockPosts.map(({ content, ...listItem }) => listItem);
};
