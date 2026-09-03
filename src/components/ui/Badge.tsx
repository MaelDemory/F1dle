import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
    'inline-flex items-center gap-1.5 rounded-full border font-medium',
    {
        variants: {
            tone: {
                neutral: 'border-border bg-surface text-secondary',
                accent: 'border-accent/30 bg-accent/10 text-accent',
                success: 'border-success/30 bg-success/10 text-success',
                warning: 'border-warning/30 bg-warning/10 text-warning',
                danger: 'border-danger/30 bg-danger/10 text-danger',
            },
            size: {
                sm: 'px-2.5 py-0.5 text-caption',
                md: 'px-3 py-1 text-footnote',
            },
        },
        defaultVariants: {
            tone: 'neutral',
            size: 'sm',
        },
    }
);

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export const Badge = ({ className, tone, size, ...props }: BadgeProps) => (
    <span className={cn(badgeVariants({ tone, size }), className)} {...props} />
);
