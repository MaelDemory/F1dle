import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type WinPanelProps = {
    icon?: ReactNode;
    eyebrow?: string;
    title: string;
    highlight?: string;
    description?: string;
    stats?: ReactNode;
    actions?: ReactNode;
    tone?: 'success' | 'danger';
    className?: string;
};

export const WinPanel = ({ icon, eyebrow, title, highlight, description, stats, actions, tone = 'success', className }: WinPanelProps) => (
    <div className={cn('text-center', className)}>
        {icon && (
            <div
                className={cn(
                    'mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border text-3xl',
                    tone === 'success' ? 'border-success/25 bg-success/10' : 'border-danger/25 bg-danger/10'
                )}
            >
                {icon}
            </div>
        )}
        {eyebrow && (
            <p className={cn('text-caption font-medium uppercase tracking-wide', tone === 'success' ? 'text-success' : 'text-danger')}>
                {eyebrow}
            </p>
        )}
        <h3 className="mt-3 text-title2 text-foreground">{title}</h3>
        {highlight && <p className="mt-3 text-body font-semibold text-foreground">{highlight}</p>}
        {description && <p className="mx-auto mt-3 max-w-md text-footnote text-secondary">{description}</p>}
        {stats && <div className="mt-6">{stats}</div>}
        {actions && <div className="mt-7 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
);
