'use client'; // Required for useRouter

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

const SearchBox = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      setQuery(''); // Optionally clear the input after search
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="キーワードで検索"
        className="p-2 border border-border rounded mr-2 text-sm flex-grow"
      />
      <button
        type="submit"
        className="px-3 py-2 border border-primary bg-primary text-primary-foreground rounded cursor-pointer text-sm"
      >
        <MagnifyingGlassIcon size={20} weight="bold" />
      </button>
    </form>
  );
};

export default SearchBox;
