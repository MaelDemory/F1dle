import { useEffect, useState } from 'react';

type UseGuessRoundFromPoolResult<T> = {
    answer: T | null;
    pool: T[];
    isLoading: boolean;
    error: string;
};

/**
 * Parameters
 *   fetchPool — loads every guessable entry for this board.
 * What it does
 *   Loads one round where the hidden entry is drawn from the pool itself, rather
 *   than fetched separately. That guarantees the answer is always reachable: the
 *   player wins by matching ids against the pool, so an answer outside it could
 *   never be guessed. Picking server-side leaves that property resting on the
 *   server and the client happening to apply the same filter.
 *
 *   Fetching runs once on mount; a new round means remounting with a new `key`.
 * Output
 *   The answer, the pool, a loading flag and a single error channel — unlike
 *   useGuessRound, a failure here costs both at once, so there is nothing to
 *   report separately.
 */
export const useGuessRoundFromPool = <T,>(
    fetchPool: () => Promise<T[]>
): UseGuessRoundFromPoolResult<T> => {
    const [answer, setAnswer] = useState<T | null>(null);
    const [pool, setPool] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        setIsLoading(true);
        setError('');

        fetchPool()
            .then((entries) => {
                if (cancelled) {
                    return;
                }

                setPool(entries);

                if (entries.length === 0) {
                    setError('empty-pool');
                    return;
                }

                setAnswer(entries[Math.floor(Math.random() * entries.length)]);
            })
            .catch((requestError: Error) => {
                if (!cancelled) {
                    setPool([]);
                    setError(requestError.message);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { answer, pool, isLoading, error };
};
