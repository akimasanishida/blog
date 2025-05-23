import { render, screen } from '@testing-library/react';
import PostList from './PostList'; // Assuming the component is in the same directory or adjust path
import type { PostListItem } from '../types/post'; // Adjust path as needed

describe('PostList', () => {
  const mockPosts: PostListItem[] = [
    {
      slug: 'first-post',
      title: 'My First Blog Post',
      publishDate: '2024-01-15T10:00:00.000Z',
      category: 'Technology',
    },
    {
      slug: 'second-post-updated',
      title: 'A Journey into Next.js',
      publishDate: '2024-02-10T10:00:00.000Z',
      updateDate: '2024-02-12T10:00:00.000Z',
      category: 'Web Development',
    },
  ];

  test('renders posts correctly', () => {
    render(<PostList posts={mockPosts} />);

    // Check for titles
    expect(screen.getByText('My First Blog Post')).toBeInTheDocument();
    expect(screen.getByText('A Journey into Next.js')).toBeInTheDocument();

    // Check for links (href attribute)
    expect(screen.getByText('My First Blog Post').closest('a')).toHaveAttribute('href', '/posts/first-post');
    expect(screen.getByText('A Journey into Next.js').closest('a')).toHaveAttribute('href', '/posts/second-post-updated');
    
    // Check for dates (formatted)
    // Note: toLocaleDateString() can be locale-dependent. For more robust tests, 
    // you might want to mock the date or check for parts of the date.
    // For simplicity here, we'll check for the presence of the date strings.
    expect(screen.getByText(`Published on: ${new Date(mockPosts[0].publishDate).toLocaleDateString()}`)).toBeInTheDocument();
    expect(screen.getByText(`Updated on: ${new Date(mockPosts[1].updateDate!).toLocaleDateString()}`)).toBeInTheDocument();

    // Check for categories
    expect(screen.getByText((content, element) => content.startsWith('Category:') && content.includes('Technology'))).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.startsWith('Category:') && content.includes('Web Development'))).toBeInTheDocument();
  });

  test('renders "No posts found." message when posts array is empty', () => {
    render(<PostList posts={[]} />);
    expect(screen.getByText('No posts found.')).toBeInTheDocument();
  });

  test('handles null posts prop gracefully by rendering "No posts found."', () => {
    // @ts-expect-error Testing null case for posts prop
    render(<PostList posts={null} />);
    expect(screen.getByText('No posts found.')).toBeInTheDocument();
  });

  test('handles undefined posts prop gracefully by rendering "No posts found."', () => {
     // @ts-expect-error Testing undefined case for posts prop
    render(<PostList posts={undefined} />);
    expect(screen.getByText('No posts found.')).toBeInTheDocument();
  });
});
