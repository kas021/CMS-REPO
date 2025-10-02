import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

type PageSizeOption = number | { label: string, value: number };

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    pageSizes: PageSizeOption[];
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizes
}) => {
    if (totalItems === 0) {
        return <div className="p-4 text-center text-gray-500">No records found.</div>;
    }

    const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 1;
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(startItem + pageSize - 1, totalItems);

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onPageSizeChange(Number(e.target.value));
        onPageChange(1); // Reset to first page on size change
    };

    return (
        <div className="flex items-center justify-between p-3 bg-brand-gray-50 border-t text-sm">
            <div className="flex items-center space-x-2">
                <span className="text-gray-600">Rows per page:</span>
                <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="p-1 border rounded-md bg-white focus:ring-brand-blue focus:border-brand-blue text-brand-gray-900"
                    aria-label="Select page size"
                >
                    {pageSizes.map(size => {
                         if (typeof size === 'object') {
                            return <option key={size.value} value={size.value}>{size.label}</option>;
                        }
                        return <option key={size} value={size}>{size}</option>
                    })}
                </select>
            </div>
            
            <div className="text-gray-600">
                {pageSize > 0 ? `${startItem} - ${endItem} of ${totalItems}` : `1 - ${totalItems} of ${totalItems}`}
            </div>

            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={isFirstPage}
                    className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Go to previous page"
                >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
                </button>
                <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={isLastPage}
                    className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Go to next page"
                >
                    <ChevronRightIcon className="w-5 h-5 text-gray-700" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;