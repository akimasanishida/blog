'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBox from '@/components/SearchBox';
import { getAllPosts } from '@/lib/firebase';
import PostList from '@/components/PostList'; // Assuming PostList is in this path
import Fuse from 'fuse.js';
import type { PostDetail } from '@/types/post';

// Export for testing
export const SearchResultsPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  const [allPosts, setAllPosts] = useState<PostDetail[]>([]);
  const [searchResults, setSearchResults] = useState<PostDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fuseInstance, setFuseInstance] = useState<Fuse<PostDetail> | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const posts = await getAllPosts();
        setAllPosts(posts);
        // Initialize Fuse instance once posts are fetched
        setFuseInstance(new Fuse(posts, {
          keys: [
            { name: 'title', weight: 0.7 },
            { name: 'content', weight: 0.3 }
          ],
          includeScore: true, // Optional: if you want to see scores
          threshold: 0.4, // Adjust threshold for sensitivity
        }));
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setAllPosts([]); // Set empty array on error
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    if (fuseInstance) {
      const results = fuseInstance.search(query);
      setSearchResults(results.map(result => result.item));
    }
  }, [query, fuseInstance]);

  if (loading) {
    return <div>Loading posts...</div>;
  }

  if (!query) {
    return <div>Please enter a search term.</div>;
  }

  return (
    <>
      <h1>&quot;{query}&quot; の検索結果</h1>
      <div className='p-4'>
        <SearchBox />
      </div>
      <hr />
      {searchResults.length === 0 ? (
        <p>&quot;{query}&quot; の検索結果はありませんでした。</p>
      ) : (
        <PostList posts={searchResults} />
      )}
    </>
  );
};

const SearchPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchResultsPageContent />
    </Suspense>
  );
};

export default SearchPage;
