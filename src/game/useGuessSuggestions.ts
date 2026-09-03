import { useCallback, useState } from 'react';

type UseGuessSuggestionsParams<T> = {
    pool: T[];
    getId: (item: T) => string | number;
    getSearchTerms: (item: T) => string[];
    /** Ids already guessed this round; they are filtered out of suggestions. */
    guessedIds: Set<string | number>;
};

/**
 * Parameters
 *   pool — every guessable item. getId / getSearchTerms — accessors from the mode.
 *   guessedIds — already-used answers, excluded so the player cannot re-pick them.
 * What it does
 *   Owns the autocomplete list, prefix-matching the query against each of the
 *   mode's search terms. An empty query yields nothing rather than the whole
 *   roster — on the All Time board the pool is 881 entries.
 * Output
 *   The current `suggestions` plus the fetch/clear callbacks react-autosuggest
 *   expects.
 */
export const useGuessSuggestions = <T,>({
    pool,
    getId,
    getSearchTerms,
    guessedIds
}: UseGuessSuggestionsParams<T>) => {
    const [suggestions, setSuggestions] = useState<T[]>([]);

    const compute = useCallback(
        (input: string): T[] => {
            const query = input.trim().toLowerCase();

            if (query.length === 0) {
                return [];
            }

            return pool.filter((item) => {
                if (guessedIds.has(getId(item))) {
                    return false;
                }

                return getSearchTerms(item).some((term) => term.toLowerCase().startsWith(query));
            });
        },
        [pool, getId, getSearchTerms, guessedIds]
    );

    const onSuggestionsFetchRequested = useCallback(
        ({ value }: { value: string }) => setSuggestions(compute(value)),
        [compute]
    );

    const onSuggestionsClearRequested = useCallback(() => setSuggestions([]), []);

    return { suggestions, onSuggestionsFetchRequested, onSuggestionsClearRequested };
};
