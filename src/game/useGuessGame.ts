import { useCallback, useMemo, useState } from 'react';
import { MAX_ATTEMPTS } from './timings';

/**
 * Why a code rather than a message: the domain layer stays free of i18n, and the
 * component decides how to phrase it.
 */
export type GuessNotice = 'duplicate' | 'invalid' | null;

type UseGuessGameParams<T> = {
    answer: T;
    pool: T[];
    getId: (item: T) => string | number;
    getFullName: (item: T) => string;
};

/**
 * Parameters
 *   answer — the item to find. pool — every guessable item.
 *   getId / getFullName — identity and display accessors from the mode.
 * What it does
 *   Owns the state of one round: accepted guesses, the transient notice, and the
 *   derived win/loss verdict. Rejects duplicates and unknown names rather than
 *   spending an attempt on them.
 * Output
 *   The round's state plus `submitGuess` (from a suggestion) and `submitByName`
 *   (from free-typed input). Both return whether the guess was accepted, so the
 *   caller can clear the input only on success and leave a typo editable —
 *   reading `guesses.length` after the call would not work, since React has not
 *   applied the update yet.
 */
export const useGuessGame = <T,>({ answer, pool, getId, getFullName }: UseGuessGameParams<T>) => {
    const [guesses, setGuesses] = useState<T[]>([]);
    const [notice, setNotice] = useState<GuessNotice>(null);

    const answerId = getId(answer);
    const hasWon = guesses.some((guess) => getId(guess) === answerId);
    const hasLost = !hasWon && guesses.length >= MAX_ATTEMPTS;
    const isComplete = hasWon || hasLost;

    const latestGuessId = guesses.length > 0 ? getId(guesses[guesses.length - 1]) : undefined;

    const clearNotice = useCallback(() => setNotice(null), []);

    const submitGuess = useCallback(
        (candidate: T): boolean => {
            if (isComplete) {
                return false;
            }

            const candidateId = getId(candidate);

            if (guesses.some((guess) => getId(guess) === candidateId)) {
                setNotice('duplicate');
                return false;
            }

            setGuesses((current) => [...current, candidate]);
            setNotice(null);
            return true;
        },
        [guesses, getId, isComplete]
    );

    const submitByName = useCallback(
        (rawName: string): boolean => {
            if (isComplete) {
                return false;
            }

            const normalized = rawName.trim().toLowerCase();
            const match = pool.find((item) => getFullName(item).toLowerCase() === normalized);

            if (!match) {
                setNotice('invalid');
                return false;
            }

            return submitGuess(match);
        },
        [pool, getFullName, isComplete, submitGuess]
    );

    const guessedIds = useMemo(
        () => new Set(guesses.map((guess) => getId(guess))),
        [guesses, getId]
    );

    return {
        guesses,
        guessedIds,
        notice,
        clearNotice,
        hasWon,
        hasLost,
        isComplete,
        latestGuessId,
        submitGuess,
        submitByName
    };
};
