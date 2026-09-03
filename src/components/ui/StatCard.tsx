import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type StatCardProps = {
    icon?: ReactNode;
    label: string;
    value: ReactNode;
    sublabel?: string;
    tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
    className?: string;
};

const iconTones = {
    neutral: 'bg-surface-raised text-secondary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
};

export const StatCard = ({ icon, label, value, sublabel, tone = 'neutral', className }: StatCardProps) => (
    <div className={cn('flex items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-1', className)}>
        {icon && (
            <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md', iconTones[tone])}>
                {icon}
            </div>
        )}
        <div className="min-w-0">
            <p className="truncate text-caption font-medium uppercase tracking-wide text-tertiary">{label}</p>
            <p className="mt-0.5 text-title3 text-foreground">{value}</p>
            {sublabel && <p className="mt-0.5 text-caption text-tertiary">{sublabel}</p>}
        </div>
    </div>
);
