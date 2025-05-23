'use client'; // Required for useRouter

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';

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
    <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search articles..."
        style={{
          padding: '0.5rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          marginRight: '0.5rem',
          fontSize: '0.9rem',
          flexGrow: 1,
        }}
      />
      <button
        type="submit"
        style={{
          padding: '0.5rem 0.75rem',
          border: '1px solid #0070f3',
          backgroundColor: '#0070f3',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        🔍
      </button>
    </form>
  );
};

export default SearchBox;
