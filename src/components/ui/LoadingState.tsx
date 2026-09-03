import React from 'react';
import { cn } from '../../lib/utils';

type LoadingStateProps = {
    label?: string;
    className?: string;
};

export const LoadingState = ({ label, className }: LoadingStateProps) => (
    <div className={cn('flex flex-col items-center gap-4 py-12', className)}>
        <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
                <span
                    key={i}
                    className="h-2.5 w-2.5 animate-pulse rounded-full bg-tertiary"
                    style={{ animationDelay: `${i * 120}ms` }}
                />
            ))}
        </div>
        {label && <p className="text-footnote text-tertiary">{label}</p>}
    </div>
);
