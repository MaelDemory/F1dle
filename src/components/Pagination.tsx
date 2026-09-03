import React from 'react';
import { Button } from './ui';

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

const getVisiblePages = (current: number, total: number): (number | '...')[] => {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 3) {
        return [1, 2, 3, 4, '...', total];
    }

    if (current >= total - 2) {
        return [1, '...', total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
};

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    const pages = getVisiblePages(currentPage, totalPages);

    return (
        <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5">
            <Button
                variant="secondary"
                size="sm"
                aria-label="Previous page"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                &lsaquo;
            </Button>

            {pages.map((page, index) =>
                page === '...' ? (
                    <span key={`dots-${index}`} className="px-2 text-footnote text-tertiary">&hellip;</span>
                ) : (
                    <Button
                        key={page}
                        variant="ghost"
                        size="sm"
                        aria-current={page === currentPage ? 'page' : undefined}
                        onClick={() => onPageChange(page)}
                        className={
                            page === currentPage
                                ? 'border border-accent/40 bg-accent/10 text-accent hover:bg-accent/15 hover:text-accent'
                                : undefined
                        }
                    >
                        {page}
                    </Button>
                )
            )}

            <Button
                variant="secondary"
                size="sm"
                aria-label="Next page"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                &rsaquo;
            </Button>
        </nav>
    );
};
