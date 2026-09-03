import React from 'react';
import { Card } from '../ui';

export type StatusTone = 'danger' | 'success' | 'warning';

export type GuessStatus = {
    tone: StatusTone;
    /** Emphasised lead-in, e.g. "Victory". */
    title: string;
    /** Sentence following the lead-in. */
    message: string;
};

const textClasses: Record<StatusTone, string> = {
    danger: 'text-danger',
    success: 'text-success',
    warning: 'text-warning'
};

type GuessStatusLineProps = {
    status: GuessStatus | null;
};

/**
 * Parameters
 *   status — the single message to show, already translated and composed, or
 *   null when there is nothing to report.
 * What it does
 *   Renders the round's status card. It deliberately takes one pre-resolved
 *   status rather than a set of booleans, so the priority between a data error,
 *   the verdict and a transient notice is decided once, by the caller.
 * Output
 *   The status card, or nothing.
 */
export const GuessStatusLine = ({ status }: GuessStatusLineProps) => {
    if (!status) {
        return null;
    }

    return (
        <Card tone={status.tone} padding="sm" className="mx-auto mt-5 max-w-3xl text-center">
            <p className={`text-footnote ${textClasses[status.tone]}`}>
                <span className="font-semibold">{status.title}</span> — {status.message}
            </p>
        </Card>
    );
};
