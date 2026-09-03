import React, { ReactNode } from 'react';
import { AppHeader } from '../AppHeader';
import { cn } from '../../lib/utils';

type PageShellProps = {
    width?: 'sm' | 'md' | 'lg' | 'xl';
    headerActions?: ReactNode;
    showHelpButton?: boolean;
    children: ReactNode;
    className?: string;
};

const widthClasses = {
    sm: 'max-w-lg',
    md: 'max-w-3xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
};

export const PageShell = ({ width = 'lg', headerActions, showHelpButton, children, className }: PageShellProps) => (
    <div className="min-h-screen">
        <AppHeader showHelpButton={showHelpButton} actions={headerActions} />
        <main className={cn('mx-auto px-4 pb-10 pt-24 sm:px-6', widthClasses[width], className)}>
            {children}
        </main>
    </div>
);

type PageHeaderProps = {
    title: string;
    subtitle?: string;
    className?: string;
};

export const PageHeader = ({ title, subtitle, className }: PageHeaderProps) => (
    <header className={cn('mb-8 text-center', className)}>
        <h1 className="text-title1 text-foreground">{title}</h1>
        {subtitle && <p className="mx-auto mt-2 max-w-xl text-callout text-secondary">{subtitle}</p>}
    </header>
);
