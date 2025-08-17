"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBox from '@/components/SearchBox';
// Remove the import since we'll use API route
import PostList from '@/components/PostList';
import Fuse from 'fuse.js';
import type { Post } from '@/types/post';

export const SearchResultsPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  const [, setAllPosts] = useState<Post[]>([]);
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fuseInstance, setFuseInstance] = useState<Fuse<Post> | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const posts: Post[] = await response.json();
        setAllPosts(posts);
        setFuseInstance(new Fuse(posts, {
          keys: [
            { name: 'title', weight: 0.7 },
            { name: 'content', weight: 0.3 }
          ],
          includeScore: true,
          threshold: 0.4,
        }));
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setAllPosts([]);
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
    return <div>読み込み中...</div>;
  }

  return (
    <>
      <h1>&quot;{query}&quot; の検索結果</h1>
      <div className='p-4'>
        <SearchBox />
      </div>
      <hr />
      <div className='p-4'>
        {searchResults.length === 0 ? (
          <p>&quot;{query}&quot; の検索結果はありませんでした。</p>
        ) : (
          <div>
            <p>
              &quot;{query}&quot; の検索結果は {searchResults.length} 件です：
            </p>
            <PostList posts={searchResults} />
          </div>
        )}
      </div>
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
