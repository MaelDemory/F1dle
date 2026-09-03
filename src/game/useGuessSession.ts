import { useCallback, useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { GuessStatus } from '../components/guess/GuessStatusLine';
import { GuessIdentity } from './types';
import { useGuessGame } from './useGuessGame';
import { useGuessSuggestions } from './useGuessSuggestions';
import { useVictoryReveal } from './useVictoryReveal';

type UseGuessSessionParams<T> = {
    identity: GuessIdentity<T>;
    answer: T;
    pool: T[];
    /** How long after a win to reveal the modal; each board sets its own. */
    revealDelayMs: number;
    /** Non-fatal pool-loading failure, surfaced in the status line. */
    loadError?: string;
    onPlayAgain: () => void;
};

/**
 * Parameters
 *   identity — how to identify, name and search the entries. answer, pool — the
 *   round's data. revealDelayMs — victory pacing. loadError — a non-fatal data
 *   failure. onPlayAgain — starts a new round.
 * What it does
 *   Assembles one round of *any* guessing board: attempts, duplicate rejection,
 *   the verdict, the autocomplete, the controlled input, the translated status
 *   message and the victory reveal. Deliberately knows nothing about how results
 *   are displayed, which is what lets a column grid and a plain pass/fail list
 *   share all of it.
 * Output
 *   Everything a board needs to render itself, minus the results view.
 */
export const useGuessSession = <T,>({
    identity,
    answer,
    pool,
    revealDelayMs,
    loadError,
    onPlayAgain
}: UseGuessSessionParams<T>) => {
    const { t } = useLanguage();
    const [value, setValue] = useState('');

    const { getId, getFullName, getSearchTerms } = identity;

    const game = useGuessGame({ answer, pool, getId, getFullName });
    const { suggestions, onSuggestionsFetchRequested, onSuggestionsClearRequested } =
        useGuessSuggestions({ pool, getId, getSearchTerms, guessedIds: game.guessedIds });
    const victory = useVictoryReveal(game.hasWon, revealDelayMs, game.guesses.length);

    const answerName = getFullName(answer);

    // Clearing only on acceptance leaves a rejected entry editable, which is how
    // both boards behaved before they shared this code.
    const clearInput = useCallback(() => {
        setValue('');
        onSuggestionsClearRequested();
    }, [onSuggestionsClearRequested]);

    const selectSuggestion = useCallback(
        (item: T) => {
            if (game.submitGuess(item)) {
                clearInput();
            }
        },
        [game, clearInput]
    );

    const submitTypedName = useCallback(() => {
        if (game.submitByName(value)) {
            clearInput();
        }
    }, [game, value, clearInput]);

    const changeValue = useCallback(
        (next: string) => {
            setValue(next);
            game.clearNotice();
        },
        [game]
    );

    const newRound = useCallback(() => {
        victory.hide();
        onPlayAgain();
    }, [victory, onPlayAgain]);

    const status = useMemo<GuessStatus | null>(() => {
        if (loadError) {
            return {
                tone: 'danger',
                title: t.search.dataErrorTitle,
                message: loadError || t.search.dataErrorDescription
            };
        }

        if (game.hasWon) {
            return {
                tone: 'success',
                title: t.common.victory,
                message: `${t.search.youFound} ${answerName}. ${t.search.perfectRead}`
            };
        }

        if (game.hasLost) {
            return {
                tone: 'warning',
                title: t.search.outOfAttempts,
                message: `${t.search.hiddenDriverWas} ${answerName}.`
            };
        }

        if (game.notice) {
            return {
                tone: 'warning',
                title: t.search.invalidGuessTitle,
                message: game.notice === 'duplicate' ? t.search.duplicateGuess : t.search.invalidGuess
            };
        }

        return null;
    }, [loadError, game.hasWon, game.hasLost, game.notice, answerName, t]);

    return {
        answerName,
        guesses: game.guesses,
        latestGuessId: game.latestGuessId,
        hasWon: game.hasWon,
        hasLost: game.hasLost,
        isComplete: game.isComplete,
        status,
        value,
        changeValue,
        suggestions,
        onSuggestionsFetchRequested,
        onSuggestionsClearRequested,
        selectSuggestion,
        submitTypedName,
        victory,
        newRound
    };
};
