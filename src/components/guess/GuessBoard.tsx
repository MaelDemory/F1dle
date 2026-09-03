import React from 'react';
import { Card } from '../ui';
import { GuessRow } from '../../game/board';
import { GuessCell } from './GuessCell';

type GuessBoardProps<T> = {
    rows: GuessRow<T>[];
    columnLabels: string[];
};

/**
 * Parameters
 *   rows — newest-first guess rows. columnLabels — translated header labels.
 * What it does
 *   Lays out the board's headers and rows. The column count comes from the mode
 *   rather than a hard-coded `grid-cols-7`, which is what previously tied the
 *   board to a single seven-column game.
 * Output
 *   The result grid, horizontally scrollable on narrow viewports.
 */
export function GuessBoard<T>({ rows, columnLabels }: GuessBoardProps<T>) {
    const gridStyle = {
        gridTemplateColumns: `repeat(${columnLabels.length}, minmax(0, 1fr))`
    };

    return (
        <Card>
            <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                    <div className="mb-3 grid gap-1.5 sm:gap-2" style={gridStyle}>
                        {columnLabels.map((label) => (
                            <div
                                key={label}
                                className="text-center text-caption font-medium uppercase tracking-wide text-tertiary"
                            >
                                {label}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                        {rows.map((row) => (
                            <div key={row.id} className="grid gap-1.5 sm:gap-2" style={gridStyle}>
                                {row.tiles.map((tile, index) => (
                                    <GuessCell
                                        key={tile.key}
                                        tile={tile}
                                        index={index}
                                        animate={row.isLatest}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
