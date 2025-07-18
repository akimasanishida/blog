'use client';

import Link from 'next/link';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage: i,
  totalPages: N,
  basePath,
}) => {
  const getPageUrl = (page: number) => {
    if (page === 1) {
      return basePath;
    }
    return `${basePath === '/' ? '' : basePath}?page=${page}`;
  };

  if (N <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center space-x-1 my-8">
      {/* < (Prev) */}
      {i >= 2 ? (
        <Button asChild variant="outline" size="icon">
          <Link href={getPageUrl(i - 1)} aria-label="前のページ">
            <CaretLeftIcon className="h-5 w-5" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" disabled>
          <CaretLeftIcon className="h-5 w-5 text-muted-foreground" />
        </Button>
      )}

      {/* 1ページ目 */}
      {i >= 3 && (
        <Button asChild variant="ghost" size="icon">
          <Link href={getPageUrl(1)} aria-label="1ページ目">
            1
          </Link>
        </Button>
      )}

      {/* ... (2〜i-2省略) */}
      {i >= 4 && (
        <span className="px-2 text-muted-foreground">...</span>
      )}

      {/* i-1ページ目 */}
      {i >= 2 && (
        <Button asChild variant="ghost" size="icon">
          <Link href={getPageUrl(i - 1)} aria-label={`${i - 1}ページ目`}>
            {i - 1}
          </Link>
        </Button>
      )}

      {/* iページ目（現在） */}
      <Button variant="default" size="icon" disabled>
        {i}
      </Button>

      {/* i+1ページ目 */}
      {i + 1 <= N && i <= 9 && (
        <Button asChild variant="ghost" size="icon">
          <Link href={getPageUrl(i + 1)} aria-label={`${i + 1}ページ目`}>
            {i + 1}
          </Link>
        </Button>
      )}

      {/* ... (i+2〜N-1省略) */}
      {i <= N - 3 && (
        <span className="px-2 text-muted-foreground">...</span>
      )}

      {/* Nページ目 */}
      {i <= N - 2 && (
        <Button asChild variant="ghost" size="icon">
          <Link href={getPageUrl(N)} aria-label={`${N}ページ目`}>
            {N}
          </Link>
        </Button>
      )}

      {/* > (Next) */}
      {i <= N - 1 ? (
        <Button asChild variant="outline" size="icon">
          <Link href={getPageUrl(i + 1)} aria-label="次のページ">
            <CaretRightIcon className="h-5 w-5" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" disabled>
          <CaretRightIcon className="h-5 w-5 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
};

export default PaginationControls;
