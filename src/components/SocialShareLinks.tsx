'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { XLogoIcon } from '@phosphor-icons/react';

type Props = {
  title: string;
};

const SocialShareLinks = ({ title }: Props) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!url) return null; // Don't render until URL is available

  return (
    <div className='flex space-x-4 mt-2 mb-4'>
      <Link
        href={`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className='text-blue-500 hover:underline'
      >
        <XLogoIcon className='inline-block w-5 h-5 !text-foreground no-underline' />
      </Link>
      {/* <Link
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className='text-blue-700 hover:underline'
      >
        Facebook
      </Link> */}
      {/* Add more social links as needed */}
    </div>
  );
};

export default SocialShareLinks;