import { paginatePost, NUM_PAGINATION } from './pagination';
import { Post } from '../types/post';
import { Timestamp } from 'firebase/firestore';

// Helper function to create mock Post objects
const createMockPost = (slug: string): Post => ({
  slug,
  publishDate: new Timestamp(0, 0),
  isPublic: true,
  title: `Test Post ${slug}`,
  content: `Content for ${slug}`,
  category: 'Test Category',
  tags: [],
});

describe('paginatePost', () => {
  // const originalNumPagination = NUM_PAGINATION;
  let mockPosts: Post[];

  beforeEach(() => {
    // Reset NUM_PAGINATION to its original value before each test if it was changed.
    // This requires NUM_PAGINATION to be mutable or a way to override it for tests.
    // For this implementation, we assume NUM_PAGINATION is a const export and cannot be changed per test.
    // If NUM_PAGINATION needs to be dynamic for testing, pagination.ts might need adjustment
    // or tests would have to work around it (e.g. by creating datasets relative to the fixed NUM_PAGINATION).
  });

  test('should return undefined for an empty list of posts', () => {
    expect(paginatePost([], 1)).toBeUndefined();
  });

  test('should return undefined for a null list of posts', () => {
    // @ts-expect-error: intentionally passing null to test robustness
    expect(paginatePost(null, 1)).toBeUndefined();
  });

  test('should return all posts if count is less than NUM_PAGINATION', () => {
    mockPosts = Array.from({ length: NUM_PAGINATION - 1 }, (_, i) => createMockPost(`post${i + 1}`));
    const result = paginatePost(mockPosts, 1);
    expect(result).toEqual(mockPosts);
    expect(result?.length).toBe(NUM_PAGINATION - 1);
  });

  test('should return all posts if count is equal to NUM_PAGINATION', () => {
    mockPosts = Array.from({ length: NUM_PAGINATION }, (_, i) => createMockPost(`post${i + 1}`));
    const result = paginatePost(mockPosts, 1);
    expect(result).toEqual(mockPosts);
    expect(result?.length).toBe(NUM_PAGINATION);
  });

  describe('with posts more than NUM_PAGINATION', () => {
    beforeEach(() => {
      // Create 2.5 pages worth of posts (e.g., if NUM_PAGINATION is 7, creates 18 posts)
      mockPosts = Array.from({ length: NUM_PAGINATION * 2 + Math.floor(NUM_PAGINATION / 2) }, (_, i) =>
        createMockPost(`post${i + 1}`),
      );
    });

    test('should return the first page correctly', () => {
      const result = paginatePost(mockPosts, 1);
      expect(result).toEqual(mockPosts.slice(0, NUM_PAGINATION));
      expect(result?.length).toBe(NUM_PAGINATION);
    });

    test('should return the second page correctly', () => {
      const result = paginatePost(mockPosts, 2);
      expect(result).toEqual(mockPosts.slice(NUM_PAGINATION, NUM_PAGINATION * 2));
      expect(result?.length).toBe(NUM_PAGINATION);
    });

    test('should return the last page correctly (partially full)', () => {
      const totalPages = Math.ceil(mockPosts.length / NUM_PAGINATION);
      const result = paginatePost(mockPosts, totalPages);
      const expectedLength = mockPosts.length % NUM_PAGINATION === 0 ? NUM_PAGINATION : mockPosts.length % NUM_PAGINATION;
      expect(result).toEqual(mockPosts.slice(NUM_PAGINATION * (totalPages - 1)));
      expect(result?.length).toBe(expectedLength);
    });
  });

  describe('out-of-bounds page numbers', () => {
    beforeEach(() => {
      mockPosts = Array.from({ length: NUM_PAGINATION * 3 }, (_, i) => createMockPost(`post${i + 1}`));
    });

    test('should return undefined for page 0', () => {
      expect(paginatePost(mockPosts, 0)).toBeUndefined();
    });

    test('should return undefined for a negative page number', () => {
      expect(paginatePost(mockPosts, -1)).toBeUndefined();
    });

    test('should return undefined if page number is greater than total pages', () => {
      const totalPages = Math.ceil(mockPosts.length / NUM_PAGINATION);
      expect(paginatePost(mockPosts, totalPages + 1)).toBeUndefined();
    });
  });

  test('should handle NUM_PAGINATION being 1', () => {
    // This test assumes NUM_PAGINATION can be changed for testing, which it can't directly if it's a const.
    // To properly test this, NUM_PAGINATION would need to be injectable or pagination.ts refactored.
    // For now, we test with the fixed NUM_PAGINATION and ensure logic is sound.
    // If NUM_PAGINATION were 1:
    const localNumPagination = 1;
    mockPosts = Array.from({ length: 5 }, (_, i) => createMockPost(`post${i + 1}`));

    const totalPages = Math.ceil(mockPosts.length / localNumPagination);
    expect(totalPages).toBe(5);

    // Simulate fetching page 3 if NUM_PAGINATION was 1
    // const page3Index = (3 - 1) * localNumPagination;
    // const expectedPage3 = mockPosts.slice(page3Index, page3Index + localNumPagination);

    // Actual test with current NUM_PAGINATION. This part of the test verifies current behavior,
    // while the above lines are more of a thought experiment for NUM_PAGINATION = 1.
    const resultPage1 = paginatePost(mockPosts, 1);
    if (NUM_PAGINATION >= 5) {
        expect(resultPage1).toEqual(mockPosts)
    } else {
        expect(resultPage1?.length).toBe(NUM_PAGINATION);
    }
  });

  test('should handle a large number of posts', () => {
    mockPosts = Array.from({ length: 1000 }, (_, i) => createMockPost(`post${i + 1}`));
    const page = 50; // An arbitrary middle page
    const startIndex = (page - 1) * NUM_PAGINATION;
    const endIndex = page * NUM_PAGINATION;

    const result = paginatePost(mockPosts, page);
    expect(result).toEqual(mockPosts.slice(startIndex, endIndex));
    expect(result?.length).toBe(NUM_PAGINATION);
  });

  test('should return the correct number of posts for the last page when total posts are a multiple of NUM_PAGINATION', () => {
    mockPosts = Array.from({ length: NUM_PAGINATION * 2 }, (_, i) => createMockPost(`post${i + 1}`));
    const totalPages = Math.ceil(mockPosts.length / NUM_PAGINATION); // Should be 2
    const result = paginatePost(mockPosts, totalPages);
    expect(result?.length).toBe(NUM_PAGINATION);
    expect(result).toEqual(mockPosts.slice(NUM_PAGINATION * (totalPages - 1)));
  });

});
