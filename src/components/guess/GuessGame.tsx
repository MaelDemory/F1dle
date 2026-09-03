import React, { useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { buildGuessRows } from '../../game/board';
import { victoryRevealDelayMs } from '../../game/timings';
import { GuessMode } from '../../game/types';
import { useGuessSession } from '../../game/useGuessSession';
import { GuessBoard } from './GuessBoard';
import { GuessSearchPanel } from './GuessSearchPanel';
import { VictoryDialog } from './VictoryDialog';

type GuessGameProps<T> = {
    mode: GuessMode<T>;
    answer: T;
    /** Every guessable entry, for the autocomplete. */
    pool: T[];
    /** Message shown when the pool failed to load. */
    loadError?: string;
    onPlayAgain: () => void;
};

/**
 * Parameters
 *   mode — the column definitions and accessors that make this game what it is.
 *   answer, pool, loadError — the round's data. onPlayAgain — starts a new round.
 * What it does
 *   Renders a comparison-grid round: it delegates every rule to useGuessSession
 *   and is left owning only the board itself. All game-specific behaviour comes
 *   from `mode`, so every grid mode shares this component unchanged.
 * Output
 *   The victory dialog, the search panel and the result board.
 */
export function GuessGame<T>({ mode, answer, pool, loadError, onPlayAgain }: GuessGameProps<T>) {
    const { t } = useLanguage();
    const { columns } = mode;

    const session = useGuessSession({
        identity: mode,
        answer,
        pool,
        // The reveal waits for the last tile of the winning row to settle.
        revealDelayMs: victoryRevealDelayMs(columns.length),
        loadError,
        onPlayAgain
    });

    const rows = useMemo(
        () => buildGuessRows(session.guesses, answer, columns, mode.getId, session.latestGuessId),
        [session.guesses, answer, columns, mode.getId, session.latestGuessId]
    );

    const columnLabels = useMemo(
        () => columns.map((column) => (t.search.labels as Record<string, string>)[column.labelKey] ?? column.key),
        [columns, t]
    );

    return (
        <>
            <VictoryDialog
                open={session.victory.isVisible}
                onClose={session.victory.hide}
                onPlayAgain={session.newRound}
                answerName={session.answerName}
                labels={{
                    eyebrow: t.common.victory,
                    title: t.search.modalTitle,
                    description: t.search.modalDescription,
                    close: t.common.close,
                    playAgain: t.common.playAgain
                }}
            />

            <div className="flex flex-1 flex-col gap-5">
                <GuessSearchPanel
                    value={session.value}
                    onValueChange={session.changeValue}
                    suggestions={session.suggestions}
                    onSuggestionsFetchRequested={session.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={session.onSuggestionsClearRequested}
                    onSuggestionSelected={session.selectSuggestion}
                    onSubmit={session.submitTypedName}
                    getFullName={mode.getFullName}
                    getSuggestionSubtitle={mode.getSuggestionSubtitle}
                    renderSuggestionBadge={mode.renderSuggestionBadge}
                    guessCount={session.guesses.length}
                    isComplete={session.isComplete}
                    canSubmit={!session.isComplete && !loadError}
                    status={session.status}
                    labels={{
                        panel: t.search.panel,
                        heading: session.isComplete ? t.search.roundComplete : t.search.nextDriver,
                        findDriver: t.search.findDriver,
                        placeholder: t.search.placeholder,
                        guess: t.common.guess,
                        newRound: t.common.newRound,
                        attempts: t.common.attempts
                    }}
                    onNewRound={session.newRound}
                />

                <GuessBoard rows={rows} columnLabels={columnLabels} />
            </div>
        </>
    );
}
