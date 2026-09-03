import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { GuessMode } from '../../game/types';
import { useGuessRound } from '../../game/useGuessRound';
import { ErrorState, LoadingState } from '../ui';
import { GuessGame } from './GuessGame';

type GuessRoundProps<T> = {
    mode: GuessMode<T>;
    /** Must be a stable reference: the round fetches once, on mount. */
    fetchAnswer: () => Promise<T>;
    fetchPool: () => Promise<T[]>;
    loadingLabel: string;
    onPlayAgain: () => void;
};

/**
 * Parameters
 *   mode — the guessing mode to play. fetchAnswer / fetchPool — the data sources.
 *   loadingLabel — mode-specific loading copy. onPlayAgain — starts a new round.
 * What it does
 *   Resolves one round's data and picks the screen that follows from it: loading,
 *   a fatal error with a retry, or the board. Being generic over the entry type,
 *   both the current-grid and All Time modes share it unchanged.
 * Output
 *   The loading state, the error state, or the guessing board.
 */
export function GuessRound<T>({
    mode,
    fetchAnswer,
    fetchPool,
    loadingLabel,
    onPlayAgain
}: GuessRoundProps<T>) {
    const { t } = useLanguage();
    const { answer, pool, isLoading, answerError, poolError } = useGuessRound(fetchAnswer, fetchPool);

    if (isLoading) {
        return <LoadingState label={loadingLabel} />;
    }

    if (answerError || !answer) {
        return (
            <ErrorState
                title={t.search.dataErrorTitle}
                message={answerError || t.search.dataErrorDescription}
                retryLabel={t.common.retry}
                onRetry={onPlayAgain}
            />
        );
    }

    return (
        <GuessGame
            mode={mode}
            answer={answer}
            pool={pool}
            loadError={poolError}
            onPlayAgain={onPlayAgain}
        />
    );
}
