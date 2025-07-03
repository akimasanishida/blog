'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  basePath,
}) => {
  const getPageUrl = (page: number) => {
    if (page === 1) {
      return basePath;
    }
    return `${basePath === '/' ? '' : basePath}?page=${page}`;
  };

  const showPrev = currentPage > 1;
  const showNext = currentPage < totalPages;

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page or no pages
  }

  return (
    <div className="flex items-center justify-center space-x-4 my-8">
      {showPrev && (
        <Button asChild variant="outline">
          <Link href={getPageUrl(currentPage - 1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Link>
        </Button>
      )}
      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
      {showNext && (
        <Button asChild variant="outline">
          <Link href={getPageUrl(currentPage + 1)}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
};

export default PaginationControls;
