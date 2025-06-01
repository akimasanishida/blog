'use client'; // Required for useState, useEffect, usePathname

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAllPosts } from '@/lib/firebase'; // Adjust path if necessary
import type { Post } from '@/types/post'; // Adjust path if necessary
import SearchBox from './SearchBox';


const Footer = () => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname(); // For determining active archive

  const [archiveData, setArchiveData] = useState<Map<string, string[]>>(new Map());
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<string[]>([]); // New state for categories
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      try {
        const posts: Post[] = await getAllPosts();
        
        // --- Process Archives (existing logic) ---
        const processedArchiveData = new Map<string, Set<string>>();
        posts.forEach(post => {
          if (!post.publishDate) return; // Skip posts without a publish date
          const date = new Date(post.publishDate);
          console.log(date, post.publishDate);
          const year = date.getUTCFullYear().toString();
          const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
          if (!processedArchiveData.has(year)) {
            processedArchiveData.set(year, new Set());
          }
          processedArchiveData.get(year)!.add(month);
        });
        const finalArchiveData = new Map<string, string[]>();
        processedArchiveData.forEach((monthsSet, year) => {
          finalArchiveData.set(year, Array.from(monthsSet).sort((a, b) => a.localeCompare(b)));
        });
        setArchiveData(finalArchiveData);

        // Initialize expandedYears (existing logic)
        const newExpandedYears = new Set<string>();
        const pathSegments = pathname.split('/').filter(Boolean);
        if (pathSegments[0] === 'archives' && pathSegments[1]) {
          const yearFromPath = pathSegments[1];
          if (finalArchiveData.has(yearFromPath)) {
            newExpandedYears.add(yearFromPath);
          }
        } else if (finalArchiveData.size > 0) {
          const mostRecentYear = Array.from(finalArchiveData.keys()).sort((a,b) => b.localeCompare(a))[0];
          if (mostRecentYear) {
            newExpandedYears.add(mostRecentYear);
          }
        }
        setExpandedYears(newExpandedYears);

        // --- Process Categories (new logic) ---
        const uniqueCategories = new Set<string>();
        posts.forEach(post => {
          if (post.category) { // Ensure category exists
            uniqueCategories.add(post.category);
          }
        });
        setCategories(Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b))); // Sort alphabetically

      } catch (error) {
        console.error("Error fetching posts for footer data:", error);
        // Handle error state if necessary
      }
      setLoading(false);
    };

    fetchAndProcessData();
  }, [pathname]); // Re-run if pathname changes

  const toggleYear = (year: string) => {
    setExpandedYears(prev => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  return (
    <footer className='border-t py-8'>
      <div className='flex justify-around mb-8 flex-wrap'>
        {/* Column 1: Archives */}
        <div className='flex-1 min-w-[200px] mb-4'>
          <h3 className='text-lg mb-2'>アーカイブ</h3>
          {loading ? (
            <p className='text-sm'>読み込み中...</p>
          ) : archiveData.size === 0 ? (
            <p className='text-sm'>利用可能なアーカイブはありません。</p>
          ) : (
            <ul className='list-none p-0 text-sm'>
              {Array.from(archiveData.keys()).sort((a, b) => b.localeCompare(a)).map(year => (
                <li key={year} className='mb-2'>
                  <div className='flex items-center'>
                    <div className='flex items-center cursor-pointer' onClick={() => toggleYear(year)}>
                      <span className='mr-2 w-2'>
                        {expandedYears.has(year) ? '▼' : '▶'}
                      </span>
                    </div>
                    <Link href={`/archives/${year}`} className='no-underline font-bold'>
                      {year}年
                    </Link>
                  </div>
                  {expandedYears.has(year) && (
                    <ul className='list-none pl-6 mt-1'>
                      {archiveData.get(year)?.map(month => (
                        <li key={month} className='mb-1'>
                          <Link href={`/archives/${year}/${month}`} className='no-underline'>
                            {/* example: 5月, 10月 (japanese). eliminate 0 padding */}
                            {parseInt(month, 10)}月
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Column 2: Categories */}
        <div className='flex-1 min-w-[200px] ml-4 mr-4 mb-4'>
          <h3 className='text-lg mb-2'>カテゴリー</h3>
          {loading ? (
            <p className='text-sm'>読み込み中...</p>
          ) : categories.length === 0 ? (
            <p className='text-sm'>利用可能なカテゴリーはありません。</p>
          ) : (
            <ul className='list-none p-0 text-sm'>
              {categories.map(category => (
                <li key={category} className='mb-1'>
                  <Link 
                    href={`/categories/${encodeURIComponent(category.toLowerCase())}`} 
                    className='no-underline'
                  >
                    {/* Display original category name, e.g., "Web Development" */}
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Column 3: Search */}
        <div className='flex-1 min-w-[200px] mb-4'>
          <h3 className='text-lg mb-2'>検索</h3>
          <SearchBox />
        </div>
      </div>
      <div className='text-center text-sm'>
        © {currentYear} 西田明正 (Akimasa NISHIDA).
      </div>
    </footer>
  );
};

export default Footer;
