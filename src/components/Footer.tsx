'use client'; // Required for useState, useEffect, usePathname

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAllPosts } from '@/lib/firebase'; // Adjust path if necessary
import type { PostListItem } from '@/types/post'; // Adjust path if necessary
import SearchBox from './SearchBox';

// Helper function to get month name from month number (1-12)
const getMonthName = (monthNumber: string): string => {
  const num = parseInt(monthNumber, 10);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[num - 1] || "Invalid Month";
};

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
        const posts: PostListItem[] = await getAllPosts();
        
        // --- Process Archives (existing logic) ---
        const processedArchiveData = new Map<string, Set<string>>();
        posts.forEach(post => {
          const date = new Date(post.publishDate);
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
    <footer style={{ borderTop: '1px solid #eaeaea', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {/* Column 1: Archives */}
        <div style={{ flex: 1, minWidth: '200px', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Archives</h3>
          {loading ? (
            <p style={{ fontSize: '0.9rem', color: '#555' }}>Loading archives...</p>
          ) : archiveData.size === 0 ? (
            <p style={{ fontSize: '0.9rem', color: '#555' }}>No archives available.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
              {Array.from(archiveData.keys()).sort((a, b) => b.localeCompare(a)).map(year => (
                <li key={year} style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleYear(year)}>
                    <span style={{ marginRight: '0.5rem', width: '10px' }}>
                      {expandedYears.has(year) ? '▼' : '▶'}
                    </span>
                    <Link href={`/archives/${year}`} style={{ textDecoration: 'none', color: '#0070f3', fontWeight: 'bold' }}>
                      {year}
                    </Link>
                  </div>
                  {expandedYears.has(year) && (
                    <ul style={{ listStyle: 'none', paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                      {archiveData.get(year)?.map(month => (
                        <li key={month} style={{ marginBottom: '0.25rem' }}>
                          <Link href={`/archives/${year}/${month}`} style={{ textDecoration: 'none', color: '#333' }}>
                            {getMonthName(month)} ({month})
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
        <div style={{ flex: 1, minWidth: '200px', marginLeft: '1rem', marginRight: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Categories</h3>
          {loading ? (
            <p style={{ fontSize: '0.9rem', color: '#555' }}>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: '#555' }}>No categories available.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
              {categories.map(category => (
                <li key={category} style={{ marginBottom: '0.25rem' }}>
                  <Link 
                    href={`/categories/${encodeURIComponent(category.toLowerCase())}`} 
                    style={{ textDecoration: 'none', color: '#333' }}
                  >
                    {/* Display original category name, e.g., "Web Development" */}
                    {category.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Column 3: Search */}
        <div style={{ flex: 1, minWidth: '200px', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Search</h3>
          <SearchBox />
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#777' }}>
        © {currentYear} 西田明正のブログ
      </div>
    </footer>
  );
};

export default Footer;
