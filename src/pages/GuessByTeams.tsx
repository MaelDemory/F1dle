import React, { useCallback, useMemo, useState } from 'react';
import { HistoricalDriver } from '../types';
import { fetchCurrentGridHistoricalDrivers, fetchHistoricalWinners } from '../api/f1dleApi';
import { byTeamsIdentity } from '../game/modes/byTeams';
import { LIST_VICTORY_REVEAL_DELAY_MS } from '../game/timings';
import { useGuessRoundFromPool } from '../game/useGuessRoundFromPool';
import { useGuessSession } from '../game/useGuessSession';
import { useTeamLogos } from '../hooks/useTeamLogos';
import { GuessSearchPanel } from '../components/guess/GuessSearchPanel';
import { GuessVerdictList } from '../components/guess/GuessVerdictList';
import { TeamsCluePanel } from '../components/guess/TeamsCluePanel';
import { VictoryDialog } from '../components/guess/VictoryDialog';
import { ErrorState, LoadingState, PageHeader, PageShell, SegmentedControl } from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * `current` draws from the drivers racing this season; `alltime` from every race
 * winner since 1950. Both boards read the same historical records — only the
 * pool differs — because `teamsHistory` is the clue and the current-grid table
 * carries a single team per driver.
 */
type Board = 'current' | 'alltime';

type TeamsBoardProps = {
    answer: HistoricalDriver;
    pool: HistoricalDriver[];
    hint?: string;
    onPlayAgain: () => void;
};

/**
 * Parameters
 *   answer, pool — the round's data. hint — the pool's constraint, shown with
 *   the clue. onPlayAgain — starts a new round.
 * What it does
 *   Renders the teams board: the clue is the hidden driver's team history, and a
 *   guess is revealed as simply right or wrong. Every shared rule — attempts,
 *   duplicates, autocomplete, victory — comes from useGuessSession.
 * Output
 *   The victory dialog, the clue panel, the search panel and the verdict list.
 */
const TeamsBoard = ({ answer, pool, hint, onPlayAgain }: TeamsBoardProps) => {
    const { t } = useLanguage();
    const logos = useTeamLogos();

    const identity = useMemo(() => byTeamsIdentity(t.drivers.wins), [t]);

    const session = useGuessSession({
        identity,
        answer,
        pool,
        revealDelayMs: LIST_VICTORY_REVEAL_DELAY_MS,
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
                    hint={hint}
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
                    canSubmit={!session.isComplete}
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
 *   board — which pool to play. onPlayAgain — starts a new round.
 * What it does
 *   Resolves the round's data and picks the screen that follows: loading, a
 *   fatal error, or the board. The answer is drawn from the pool it fetched,
 *   which is what guarantees it can be guessed.
 * Output
 *   The loading state, the error state, or the board.
 */
const Round = ({ board, onPlayAgain }: { board: Board; onPlayAgain: () => void }) => {
    const { t } = useLanguage();
    const isAllTime = board === 'alltime';

    const { answer, pool, isLoading, error } = useGuessRoundFromPool(
        isAllTime ? fetchHistoricalWinners : fetchCurrentGridHistoricalDrivers
    );

    if (isLoading) {
        return <LoadingState label={t.guessByTeams.loading} />;
    }

    if (error || !answer) {
        return (
            <ErrorState
                title={t.search.dataErrorTitle}
                message={error === 'empty-pool' ? t.guessByTeams.emptyPool : error || t.search.dataErrorDescription}
                retryLabel={t.common.retry}
                onRetry={onPlayAgain}
            />
        );
    }

    return (
        <TeamsBoard
            answer={answer}
            pool={pool}
            // Only the All Time board narrows its pool by a rule the player
            // cannot see, so only it needs spelling out.
            hint={isAllTime ? t.guessByTeams.winnersOnlyHint : undefined}
            onPlayAgain={onPlayAgain}
        />
    );
};

export const GuessByTeams = () => {
    const { t } = useLanguage();
    const [board, setBoard] = useState<Board>('current');
    const [round, setRound] = useState(0);

    const handlePlayAgain = useCallback(() => {
        setRound((current) => current + 1);
    }, []);

    // Switching board draws a fresh answer, so it counts as a new round.
    const handleBoardChange = useCallback((next: Board) => {
        setBoard(next);
        setRound((current) => current + 1);
    }, []);

    const isAllTime = board === 'alltime';

    return (
        <PageShell>
            <PageHeader
                title={isAllTime ? t.guessByTeams.allTimeTitle : t.guessByTeams.currentTitle}
                subtitle={isAllTime ? t.guessByTeams.allTimeMode : t.guessByTeams.currentMode}
            />

            <div className="mb-5 flex justify-center">
                <SegmentedControl<Board>
                    value={board}
                    onChange={handleBoardChange}
                    options={[
                        { value: 'current', label: t.guessByTeams.modeCurrent },
                        { value: 'alltime', label: t.guessByTeams.modeAllTime }
                    ]}
                />
            </div>

            {/* The key remounts the round, which is what clears the previous board. */}
            <Round key={`${board}-${round}`} board={board} onPlayAgain={handlePlayAgain} />
        </PageShell>
    );
};
