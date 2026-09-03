import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

type ErrorStateProps = {
    title: string;
    message?: string;
    retryLabel?: string;
    onRetry?: () => void;
};

export const ErrorState = ({ title, message, retryLabel, onRetry }: ErrorStateProps) => (
    <Card tone="danger" padding="lg" className="text-center">
        <p className="text-callout font-semibold text-danger">{title}</p>
        {message && <p className="mx-auto mt-2 max-w-2xl text-footnote text-secondary">{message}</p>}
        {onRetry && retryLabel && (
            <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
                {retryLabel}
            </Button>
        )}
    </Card>
);
