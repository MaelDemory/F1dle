import React from 'react';
import { motion } from 'motion/react';
import { spring } from '../../lib/motion';
import { CellTone } from '../../game/types';
import { GuessTile } from '../../game/board';
import { TILE_FLIP_STAGGER_MS } from '../../game/timings';

const toneClasses: Record<CellTone, string> = {
    neutral: 'border-border bg-surface-raised text-foreground',
    correct: 'border-success/50 bg-success text-white',
    miss: 'border-danger/50 bg-danger text-white',
    empty: 'border-border/50 bg-surface text-tertiary'
};

const arrowFor = (direction: GuessTile['direction']): string => {
    if (direction === 'up') {
        return '↑';
    }

    if (direction === 'down') {
        return '↓';
    }

    return '';
};

type GuessCellProps = {
    tile: GuessTile;
    /** Position in the row, driving the staggered entrance. */
    index: number;
    /** Only the newest row animates; older rows render statically. */
    animate: boolean;
};

/**
 * Parameters
 *   tile — text, tone and optional direction. index — column position.
 *   animate — whether to play the entrance animation.
 * What it does
 *   Renders one board tile, appending the up/down hint arrow when the column
 *   reported one, and staggering its entrance by its column position.
 * Output
 *   A tile element, animated only when it belongs to the newest guess.
 */
export const GuessCell = ({ tile, index, animate }: GuessCellProps) => {
    const className = `rounded-md border p-2 text-center sm:p-3 ${toneClasses[tile.tone]}`;
    const label = `${tile.content} ${arrowFor(tile.direction)}`.trim();
    const content = <p className="text-caption font-semibold sm:text-footnote">{label}</p>;

    if (!animate) {
        return <div className={className}>{content}</div>;
    }

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, rotateX: -90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{ ...spring, delay: (index * TILE_FLIP_STAGGER_MS) / 1000 }}
        >
            {content}
        </motion.div>
    );
};
