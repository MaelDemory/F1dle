import React from 'react';
import { motion } from 'motion/react';
import { spring } from '../../lib/motion';
import { Card } from '../ui';

export type VerdictRow = {
    id: string | number;
    name: string;
    subtitle: string;
    isCorrect: boolean;
};

type GuessVerdictListProps = {
    rows: VerdictRow[];
    label: string;
};

/**
 * Parameters
 *   rows — guesses, newest first, each already judged right or wrong.
 *   label — panel heading.
 * What it does
 *   Reveals guesses as a plain pass/fail list, for boards that have no per-column
 *   comparison to show. Used by the teams board, where the only clue is the
 *   answer's team history and a guess is simply right or wrong.
 * Output
 *   The list card, or nothing when no guess has been made.
 */
export const GuessVerdictList = ({ rows, label }: GuessVerdictListProps) => {
    if (rows.length === 0) {
        return null;
    }

    return (
        <Card>
            <p className="mb-4 text-center text-caption font-medium uppercase tracking-wide text-tertiary">
                {label}
            </p>
            <div className="space-y-2">
                {rows.map((row) => (
                    <motion.div
                        key={row.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={spring}
                        className={`flex items-center justify-between gap-3 rounded-md border p-4 text-white ${
                            row.isCorrect ? 'border-success/50 bg-success' : 'border-danger/50 bg-danger'
                        }`}
                    >
                        <div className="min-w-0">
                            <p className="truncate text-callout font-semibold">{row.name}</p>
                            <p className="mt-0.5 text-caption opacity-80">{row.subtitle}</p>
                        </div>
                        <span aria-hidden="true" className="text-body font-semibold">
                            {row.isCorrect ? '✓' : '✗'}
                        </span>
                    </motion.div>
                ))}
            </div>
        </Card>
    );
};
