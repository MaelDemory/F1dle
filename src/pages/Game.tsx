import React, { useCallback, useState } from 'react';
import {
    fetchDrivers,
    fetchHistoricalDrivers,
    fetchRandomDriver,
    fetchRandomHistoricalDriver
} from '../api/f1dleApi';
import { GuessRound } from '../components/guess/GuessRound';
import { currentGridMode } from '../game/modes/currentGrid';
import { allTimeMode } from '../game/modes/allTime';
import { PageHeader, PageShell, SegmentedControl } from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';

type GameMode = 'current' | 'alltime';

export const Game = () => {
    const { t } = useLanguage();
    const [mode, setMode] = useState<GameMode>('current');
    const [round, setRound] = useState(0);

    const handlePlayAgain = useCallback(() => {
        setRound((current) => current + 1);
    }, []);

    // Switching mode draws a fresh answer, so it counts as a new round.
    const handleModeChange = useCallback((next: GameMode) => {
        setMode(next);
        setRound((current) => current + 1);
    }, []);

    const isAllTime = mode === 'alltime';

    return (
        <PageShell width="lg">
            <PageHeader
                title={isAllTime ? t.game.allTimeTitle : t.game.title}
                subtitle={isAllTime ? t.game.allTimeMode : t.game.mode}
            />

            <div className="mb-5 flex justify-center">
                <SegmentedControl<GameMode>
                    value={mode}
                    onChange={handleModeChange}
                    options={[
                        { value: 'current', label: t.game.modeCurrent },
                        { value: 'alltime', label: t.game.modeAllTime }
                    ]}
                />
            </div>

            {/*
              The key remounts the round on every mode switch and every replay,
              which is what clears the previous board's guesses.
            */}
            {isAllTime ? (
                <GuessRound
                    key={`alltime-${round}`}
                    mode={allTimeMode}
                    fetchAnswer={fetchRandomHistoricalDriver}
                    fetchPool={fetchHistoricalDrivers}
                    loadingLabel={t.game.allTimeLoading}
                    onPlayAgain={handlePlayAgain}
                />
            ) : (
                <GuessRound
                    key={`current-${round}`}
                    mode={currentGridMode}
                    fetchAnswer={fetchRandomDriver}
                    fetchPool={fetchDrivers}
                    loadingLabel={t.game.loading}
                    onPlayAgain={handlePlayAgain}
                />
            )}
        </PageShell>
    );
};
