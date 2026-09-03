import { CellFeedback } from './types';

/**
 * Parameters
 *   guessValue, answerValue — the two strings to compare.
 * What it does
 *   Exact, case-sensitive equality. Values come from the same API field on both
 *   sides, so they are already normalised.
 * Output
 *   `correct` when identical, `miss` otherwise. Never carries a direction.
 */
export const compareText = (guessValue: string, answerValue: string): CellFeedback => ({
    tone: guessValue === answerValue ? 'correct' : 'miss'
});

/**
 * Parameters
 *   guessValue, answerValue — the two numbers to compare.
 * What it does
 *   Compares magnitudes and, on a miss, points the player toward the answer.
 * Output
 *   `correct` on equality; otherwise `miss` with `direction: 'up'` when the
 *   answer is higher than the guess, `'down'` when it is lower.
 */
export const compareNumber = (guessValue: number, answerValue: number): CellFeedback => {
    if (guessValue === answerValue) {
        return { tone: 'correct' };
    }

    return {
        tone: 'miss',
        direction: guessValue < answerValue ? 'up' : 'down'
    };
};

/**
 * Parameters
 *   guessValues, answerValues — two collections of labels, e.g. team histories.
 * What it does
 *   Tests whether the two sets overlap at all. Used for the All Time mode's team
 *   column, where a historical driver has raced for several outfits and exact
 *   equality of "last team" would almost never match. Two empty collections do
 *   not count as a match: sharing nothing is not sharing something.
 * Output
 *   `correct` when at least one value is common, `miss` otherwise.
 */
export const compareSet = (
    guessValues: readonly string[],
    answerValues: readonly string[]
): CellFeedback => {
    const answerSet = new Set(answerValues);
    const hasOverlap = guessValues.some((value) => answerSet.has(value));

    return { tone: hasOverlap ? 'correct' : 'miss' };
};
