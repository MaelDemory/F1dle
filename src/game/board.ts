import { CellFeedback, GuessColumn } from './types';

export type GuessTile = {
    key: string;
    tone: CellFeedback['tone'];
    direction?: CellFeedback['direction'];
    content: string;
};

export type GuessRow<T> = {
    id: string | number;
    item: T;
    tiles: GuessTile[];
    isLatest: boolean;
};

/**
 * Parameters
 *   item — one guessed entry. answer — the hidden entry. columns — the mode's
 *   column definitions.
 * What it does
 *   Turns a guess into its row of tiles by asking each column for its text and,
 *   when the column defines one, its comparison against the answer.
 * Output
 *   One tile per column, in declaration order.
 */
export const buildTiles = <T,>(item: T, answer: T, columns: GuessColumn<T>[]): GuessTile[] =>
    columns.map((column) => {
        const feedback = column.compare ? column.compare(item, answer) : { tone: 'neutral' as const };

        return {
            key: column.key,
            tone: feedback.tone,
            direction: feedback.direction,
            content: column.display(item)
        };
    });

/**
 * Parameters
 *   guesses — accepted guesses in submission order. answer, columns — as above.
 *   getId — identity accessor. latestId — id of the most recent guess.
 * What it does
 *   Builds the board's rows newest-first, which is the reading order the board
 *   renders, and flags the newest row so only it plays the entrance animation.
 * Output
 *   Rows in reverse-chronological order.
 */
export const buildGuessRows = <T,>(
    guesses: T[],
    answer: T,
    columns: GuessColumn<T>[],
    getId: (item: T) => string | number,
    latestId: string | number | undefined
): GuessRow<T>[] =>
    [...guesses].reverse().map((item) => {
        const id = getId(item);

        return {
            id,
            item,
            tiles: buildTiles(item, answer, columns),
            isLatest: id === latestId
        };
    });
