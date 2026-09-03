import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const cardVariants = cva('rounded-lg border', {
    variants: {
        tone: {
            neutral: 'border-border bg-surface shadow-1',
            success: 'border-success/25 bg-success/10',
            warning: 'border-warning/25 bg-warning/10',
            danger: 'border-danger/25 bg-danger/10',
        },
        padding: {
            none: '',
            sm: 'p-4',
            md: 'p-5 sm:p-6',
            lg: 'p-6 sm:p-8',
        },
    },
    defaultVariants: {
        tone: 'neutral',
        padding: 'md',
    },
});

type CardProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, tone, padding, ...props }, ref) => (
        <div ref={ref} className={cn(cardVariants({ tone, padding }), className)} {...props} />
    )
);
Card.displayName = 'Card';
