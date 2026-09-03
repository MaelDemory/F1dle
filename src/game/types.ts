import { ReactNode } from 'react';

/** Visual state of a single tile on the guessing board. */
export type CellTone = 'neutral' | 'correct' | 'miss' | 'empty';

export type CellFeedback = {
    tone: CellTone;
    /** Hint that the answer's value is higher (`up`) or lower (`down`). */
    direction?: 'up' | 'down';
};

/**
 * One column of the guessing board.
 *
 * `display` turns an item into the tile's text; `compare` decides the tile's
 * colour. A column without `compare` is informational only and stays neutral —
 * that is how the driver-name column works.
 */
export type GuessColumn<T> = {
    key: string;
    /** Key into `t.search.labels`, so headers stay translatable. */
    labelKey: string;
    display: (item: T) => string;
    compare?: (guess: T, answer: T) => CellFeedback;
};

/**
 * How to identify, name and search one kind of guessable entry.
 *
 * Split out from GuessMode because the shared round logic — attempts,
 * duplicates, autocomplete, victory — needs only this. The teams board has no
 * columns at all, yet reuses every bit of that logic.
 */
export type GuessIdentity<T> = {
    getId: (item: T) => string | number;
    getFullName: (item: T) => string;
    /**
     * Strings the autocomplete prefix-matches against. Declared per mode rather
     * than derived by splitting the full name, because splitting would silently
     * widen matching for multi-word given names ("Andrea Kimi") — the search
     * would start accepting middle names it never accepted before.
     */
    getSearchTerms: (item: T) => string[];
    /** Secondary line under the name in an autocomplete suggestion. */
    getSuggestionSubtitle: (item: T) => string;
    /** Trailing badge in an autocomplete suggestion. */
    renderSuggestionBadge?: (item: T) => ReactNode;
};

/**
 * An identity plus the columns of a comparison board.
 *
 * A mode is a value, not a component: adding a grid mode means declaring its
 * columns and accessors, never re-implementing the board or the round logic.
 */
export type GuessMode<T> = GuessIdentity<T> & {
    columns: GuessColumn<T>[];
};
