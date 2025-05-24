import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchResultsPageContent } from './page'; // Named import
import type { PostDetail } from '@/types/post';

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchResultsPageContent } from './page'; // Named import
import type { PostDetail } from '@/types/post';

// Import the mocked functions to control them in tests
import { getAllPosts as mockedGetAllPosts } from '@/lib/firebase';
import MockedFuse from 'fuse.js'; // This will be the mock constructor

// --- Mocks ---

// Mock next/navigation
// Define the function that useSearchParams().get will use
const actualMockGetFromSearchParams = jest.fn();
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useSearchParams: () => ({
    get: actualMockGetFromSearchParams, // Use the pre-defined function
  }),
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock @/lib/firebase
// This ensures that when SearchResultsPageContent imports getAllPosts, it gets a Jest mock function.
jest.mock('@/lib/firebase', () => ({
  getAllPosts: jest.fn(), // This is the mock function itself
}));

// Mock Fuse.js
// Define the function that fuseInstance.search() will use
const actualMockFuseSearch = jest.fn();
// The default export of 'fuse.js' is the Fuse class constructor.
// So, we mock 'fuse.js' to be a jest.fn() that, when called (as a constructor),
// returns an object with a 'search' method.
jest.mock('fuse.js', () => {
  // This mock function will be the Fuse constructor
  return jest.fn().mockImplementation((items, options) => {
    // console.log('Mocked Fuse constructor called with:', items, options);
    return {
      search: actualMockFuseSearch, // The instance's search method
    };
  });
});

// Mock @/components/PostList
jest.mock('@/components/PostList', () => {
  // eslint-disable-next-line react/display-name
  return ({ posts }: { posts: PostDetail[] }) => (
    <div data-testid="post-list">
      {posts.map(post => (
        <div key={post.slug} data-testid={`post-item-${post.slug}`}>{post.title}</div>
      ))}
    </div>
  );
});

// --- Test Data ---
const mockPosts: PostDetail[] = [
  { slug: 'post-1', title: 'First Post', content: 'Content of first post', publishDate: '2023-01-01', category: 'Tech' },
  { slug: 'post-2', title: 'Second Post', content: 'Content of second post', publishDate: '2023-01-02', category: 'News' },
  { slug: 'post-3', title: 'Another Test Post', content: 'More content here', publishDate: '2023-01-03', category: 'Tech' },
];

// --- Tests ---
describe('SearchResultsPageContent', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    actualMockGetFromSearchParams.mockClear();
    (mockedGetAllPosts as jest.Mock).mockClear(); // Clear the imported mock
    (MockedFuse as jest.Mock).mockClear(); // Clear the mock constructor
    actualMockFuseSearch.mockClear(); // Clear the search method mock
  });

  test('displays loading message initially', async () => {
    (mockedGetAllPosts as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<SearchResultsPageContent />);
    expect(screen.getByText('Loading posts...')).toBeInTheDocument();
  });

  test('displays search query and fetches posts', async () => {
    actualMockGetFromSearchParams.mockReturnValue('testquery');
    (mockedGetAllPosts as jest.Mock).mockResolvedValue(mockPosts);
    actualMockFuseSearch.mockReturnValue([]); 

    render(<SearchResultsPageContent />);

    await waitFor(() => expect(screen.queryByText('Loading posts...')).not.toBeInTheDocument());
    
    expect(screen.getByText('Search results for: "testquery"')).toBeInTheDocument();
    expect(mockedGetAllPosts).toHaveBeenCalledTimes(1);
  });

  test('filters posts with Fuse.js and displays results', async () => {
    const query = 'first';
    actualMockGetFromSearchParams.mockReturnValue(query);
    (mockedGetAllPosts as jest.Mock).mockResolvedValue(mockPosts);
    
    const filteredResults = [mockPosts[0]]; 
    actualMockFuseSearch.mockReturnValue(filteredResults.map(item => ({ item, score: 0.1 })));

    render(<SearchResultsPageContent />);

    // Wait specifically for the post list to appear,
    // which means loading is done and search results are processed.
    await waitFor(() => {
      expect(screen.getByTestId('post-list')).toBeInTheDocument();
    });
    
    // Check if Fuse constructor (MockedFuse) was called correctly
    expect(MockedFuse).toHaveBeenCalledWith(mockPosts, {
        keys: [
            { name: 'title', weight: 0.7 },
            { name: 'content', weight: 0.3 }
        ],
        includeScore: true,
        threshold: 0.4,
    });
    // Check if the search method (actualMockFuseSearch) was called correctly
    expect(actualMockFuseSearch).toHaveBeenCalledWith(query);
    
    // These assertions should now pass since getByTestId('post-list') passed in waitFor
    expect(screen.getByTestId('post-item-post-1')).toHaveTextContent('First Post');
    expect(screen.queryByTestId('post-item-post-2')).not.toBeInTheDocument();
  });

  test('displays "no results" message', async () => {
    const query = 'nonexistent';
    actualMockGetFromSearchParams.mockReturnValue(query);
    (mockedGetAllPosts as jest.Mock).mockResolvedValue(mockPosts);
    actualMockFuseSearch.mockReturnValue([]); 

    render(<SearchResultsPageContent />);

    await waitFor(() => expect(screen.queryByText('Loading posts...')).not.toBeInTheDocument());
    
    expect(screen.getByText(`"${query}" の検索結果はありませんでした。`)).toBeInTheDocument();
    expect(screen.queryByTestId('post-list')).not.toBeInTheDocument();
  });

  test('displays "Please enter a search term" if no query', async () => {
    actualMockGetFromSearchParams.mockReturnValue(null); 
    (mockedGetAllPosts as jest.Mock).mockResolvedValue(mockPosts);

    render(<SearchResultsPageContent />);

    await waitFor(() => expect(screen.queryByText('Loading posts...')).not.toBeInTheDocument());
    
    expect(screen.getByText('Please enter a search term.')).toBeInTheDocument();
    expect(actualMockFuseSearch).not.toHaveBeenCalled();
  });
});
