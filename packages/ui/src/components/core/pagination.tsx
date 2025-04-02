'use client';

import { useMemo } from 'react';
import { classNames } from 'model/src/utils';
import { Button } from '../catalyst/button';

export interface PaginationProps {
  /**
   * Current page number (1-based)
   */
  currentPage: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void;
  /**
   * Optional className for styling
   */
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const pages = useMemo(() => {
    // Always show first and last page
    // Show 2 pages before and after current page
    const pageNumbers = new Set<number>();

    // Add first and last pages
    pageNumbers.add(1);
    pageNumbers.add(totalPages);

    // Add current page and 2 pages before/after
    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages, currentPage + 1);
      i++
    ) {
      pageNumbers.add(i);
    }

    // Convert to sorted array
    return Array.from(pageNumbers).sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  const renderPageButton = (pageNum: number) => (
    <Button
      className={classNames(
        'min-w-[2.5rem]',
        pageNum === currentPage ? 'bg-blue-500 text-white' : ''
      )}
      key={pageNum}
      onClick={() => {
        onPageChange(pageNum);
      }}
      plain={(pageNum !== currentPage) as true}
    >
      {pageNum}
    </Button>
  );

  return (
    <div className={classNames('flex items-center gap-2', className)}>
      {pages.map((pageNum, index) => {
        if (index > 0) {
          const prevPage = pages[index - 1];
          if (pageNum - prevPage > 1) {
            // Add ellipsis between non-consecutive pages
            return (
              <div
                className="flex items-center gap-2"
                key={`${prevPage}-${pageNum}`}
              >
                <span className="px-1">...</span>
                {renderPageButton(pageNum)}
              </div>
            );
          }
        }
        return renderPageButton(pageNum);
      })}
    </div>
  );
};
