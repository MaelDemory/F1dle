import React, { useCallback, useMemo, useState } from 'react';
import { HistoricalDriver } from '../types';
import { fetchHistoricalWinners, fetchRandomHistoricalWinner } from '../api/f1dleApi';
import { byTeamsIdentity } from '../game/modes/byTeams';
import { LIST_VICTORY_REVEAL_DELAY_MS } from '../game/timings';
import { useGuessRound } from '../game/useGuessRound';
import { useGuessSession } from '../game/useGuessSession';
import { useTeamLogos } from '../hooks/useTeamLogos';
import { GuessSearchPanel } from '../components/guess/GuessSearchPanel';
import { GuessVerdictList } from '../components/guess/GuessVerdictList';
import { TeamsCluePanel } from '../components/guess/TeamsCluePanel';
import { VictoryDialog } from '../components/guess/VictoryDialog';
import { ErrorState, LoadingState, PageHeader, PageShell } from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';

type BoardProps = {
    answer: HistoricalDriver;
    pool: HistoricalDriver[];
    loadError?: string;
    onPlayAgain: () => void;
};

/**
 * Parameters
 *   answer, pool, loadError — the round's data. onPlayAgain — starts a new round.
 * What it does
 *   Renders the teams board. The clue is the hidden driver's team history, and a
 *   guess is revealed as simply right or wrong — there is no column comparison,
 *   which is the one thing this board does not share with the grid games. Every
 *   rule it does share comes from useGuessSession.
 * Output
 *   The victory dialog, the clue panel, the search panel and the verdict list.
 */
const Board = ({ answer, pool, loadError, onPlayAgain }: BoardProps) => {
    const { t } = useLanguage();
    const logos = useTeamLogos();

    const identity = useMemo(() => byTeamsIdentity(t.drivers.wins), [t]);

    const session = useGuessSession({
        identity,
        answer,
        pool,
        revealDelayMs: LIST_VICTORY_REVEAL_DELAY_MS,
        loadError,
        onPlayAgain
    });

    const rows = useMemo(
        () =>
            [...session.guesses].reverse().map((guess) => ({
                id: guess.driverId,
                name: identity.getFullName(guess),
                subtitle: identity.getSuggestionSubtitle(guess),
                isCorrect: guess.driverId === answer.driverId
            })),
        [session.guesses, identity, answer.driverId]
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

            <div className="flex flex-col gap-5">
                <TeamsCluePanel
                    teams={answer.teamsHistory}
                    logos={logos}
                    label={t.guessByTeams.teamsClue}
                />

                <GuessSearchPanel
                    value={session.value}
                    onValueChange={session.changeValue}
                    suggestions={session.suggestions}
                    onSuggestionsFetchRequested={session.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={session.onSuggestionsClearRequested}
                    onSuggestionSelected={session.selectSuggestion}
                    onSubmit={session.submitTypedName}
                    getFullName={identity.getFullName}
                    getSuggestionSubtitle={identity.getSuggestionSubtitle}
                    renderSuggestionBadge={identity.renderSuggestionBadge}
                    guessCount={session.guesses.length}
                    isComplete={session.isComplete}
                    canSubmit={!session.isComplete && !loadError}
                    status={session.status}
                    labels={{
                        panel: t.search.panel,
                        heading: session.isComplete ? t.search.roundComplete : t.search.nextDriver,
                        findDriver: t.search.findDriver,
                        placeholder: t.guessByTeams.placeholder,
                        guess: t.common.guess,
                        newRound: t.common.newRound,
                        attempts: t.common.attempts
                    }}
                    onNewRound={session.newRound}
                />

                <GuessVerdictList rows={rows} label={t.guessByTeams.previousGuesses} />
            </div>
        </>
    );
};

/**
 * Parameters
 *   onPlayAgain — starts a new round.
 * What it does
 *   Resolves the round's data and picks the screen that follows: loading, a fatal
 *   error, or the board. Mirrors GuessRound, but is local because this board is
 *   not a column grid and so cannot use that component's GuessGame.
 * Output
 *   The loading state, the error state, or the board.
 */
const Round = ({ onPlayAgain }: { onPlayAgain: () => void }) => {
    const { t } = useLanguage();
    const { answer, pool, isLoading, answerError, poolError } = useGuessRound(
        fetchRandomHistoricalWinner,
        fetchHistoricalWinners
    );

    if (isLoading) {
        return <LoadingState label={t.guessByTeams.loading} />;
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

    return <Board answer={answer} pool={pool} loadError={poolError} onPlayAgain={onPlayAgain} />;
};

export const GuessByTeams = () => {
    const { t } = useLanguage();
    const [round, setRound] = useState(0);

    const handlePlayAgain = useCallback(() => {
        setRound((current) => current + 1);
    }, []);

    return (
        <PageShell>
            <PageHeader title={t.guessByTeams.title} subtitle={t.guessByTeams.mode} />
            {/* The key remounts the round, which is what clears the previous board. */}
            <Round key={round} onPlayAgain={handlePlayAgain} />
        </PageShell>
    );
};
