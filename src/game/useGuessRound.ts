import { useEffect, useState } from 'react';

type UseGuessRoundResult<T> = {
    answer: T | null;
    pool: T[];
    isLoading: boolean;
    /** Fatal: without an answer there is no round to play. */
    answerError: string;
    /** Non-fatal: the board still works, only the autocomplete is empty. */
    poolError: string;
};

/**
 * Parameters
 *   fetchAnswer — draws the hidden entry. fetchPool — loads every guessable entry.
 * What it does
 *   Loads one round's data. The two failures are kept apart on purpose: a missing
 *   answer makes the round unplayable and takes over the screen, whereas a missing
 *   pool only costs the autocomplete and is reported in the status line.
 *
 *   Fetching runs once on mount. Starting a new round is done by remounting this
 *   component with a new `key`, which is how the round counter has always worked
 *   — it also discards the previous round's guesses for free.
 * Output
 *   The answer, the pool, a loading flag and the two error channels.
 */
export const useGuessRound = <T,>(
    fetchAnswer: () => Promise<T>,
    fetchPool: () => Promise<T[]>
): UseGuessRoundResult<T> => {
    const [answer, setAnswer] = useState<T | null>(null);
    const [pool, setPool] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [answerError, setAnswerError] = useState('');
    const [poolError, setPoolError] = useState('');

    useEffect(() => {
        let cancelled = false;

        setIsLoading(true);
        setAnswerError('');

        fetchAnswer()
            .then((data) => {
                if (!cancelled) {
                    setAnswer(data);
                }
            })
            .catch((error: Error) => {
                if (!cancelled) {
                    setAnswerError(error.message);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoading(false);
                }
            });

        fetchPool()
            .then((data) => {
                if (!cancelled) {
                    setPool(data);
                    setPoolError('');
                }
            })
            .catch((error: Error) => {
                if (!cancelled) {
                    setPool([]);
                    setPoolError(error.message);
                }
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { answer, pool, isLoading, answerError, poolError };
};
