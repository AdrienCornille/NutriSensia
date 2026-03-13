'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className='flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl'>
      <p className='text-sm text-gray-500'>
        {start}-{end} sur {totalItems}
      </p>
      <div className='flex items-center gap-1'>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className='p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
        >
          <ChevronLeft className='w-4 h-4' />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => {
            // Show first, last, current, and neighbors
            if (page === 1 || page === totalPages) return true;
            if (Math.abs(page - currentPage) <= 1) return true;
            return false;
          })
          .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
            if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
              acc.push('ellipsis');
            }
            acc.push(page);
            return acc;
          }, [])
          .map((item, idx) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${idx}`}
                className='px-1 text-gray-400 text-sm'
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  item === currentPage
                    ? 'bg-[#1B998B] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item}
              </button>
            )
          )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className='p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
        >
          <ChevronRight className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
