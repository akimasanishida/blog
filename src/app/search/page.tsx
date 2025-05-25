import React from 'react';
import SearchPageClient from './SearchPageClient';

export const dynamic = "force-dynamic";

const generateMetadata = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  const { q } = await searchParams;
  const query = q ?? '';

  return {
    title: `"${query}" の検索結果`,
    description: `"${query}" を含む投稿一覧`,
  };
};

const SearchPage: React.FC = () => {
  return <SearchPageClient />;
};

export default SearchPage;
export { generateMetadata };