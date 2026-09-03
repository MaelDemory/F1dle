import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { HistoricalDriver } from '../types';
import { fetchHistoricalDrivers } from '../api/f1dleApi';
import { useLanguage } from '../i18n/LanguageContext';
import { springBouncy } from '../lib/motion';
import { Badge, Button, Card, ErrorState, LoadingState, PageHeader, PageShell, StatCard, WinPanel } from '../components/ui';
import { TrendingUp, TrendingDown, Trophy, Zap, Target, RotateCcw, Flag } from 'lucide-react';

const STORAGE_KEY = 'f1dle-higher-lower-best';

type Stat = 'totalWins' | 'totalPoints' | 'championships' | 'seasonsActive';

interface StatDef {
    key: Stat;
    enLabel: string;
    icon: React.ReactNode;
}

const STATS: StatDef[] = [
    { key: 'totalWins', enLabel: 'Wins', icon: <Trophy className="h-4 w-4" /> },
    { key: 'totalPoints', enLabel: 'Points', icon: <Zap className="h-4 w-4" /> },
    { key: 'championships', enLabel: 'Titles', icon: <Trophy className="h-4 w-4" /> },
    { key: 'seasonsActive', enLabel: 'Seasons', icon: <Target className="h-4 w-4" /> },
];

const getStatValue = (driver: HistoricalDriver, stat: Stat): number => {
    switch (stat) {
        case 'totalWins': return driver.totalWins;
        case 'totalPoints': return driver.totalPoints;
        case 'championships': return driver.championships;
        case 'seasonsActive': return driver.seasonsActive;
    }
};

const getStatLabel = (stat: Stat, t: any): string => {
    const map: Record<Stat, string> = {
        totalWins: t.higherLower.stats.totalWins,
        totalPoints: t.higherLower.stats.totalPoints,
        championships: t.higherLower.stats.championships,
        seasonsActive: t.higherLower.stats.seasonsActive,
    };
    return map[stat];
};

const loadBestStreak = (): number => {
    try {
        return Number(window.localStorage.getItem(STORAGE_KEY)) || 0;
    } catch { return 0; }
};

const saveBestStreak = (streak: number) => {
    try { window.localStorage.setItem(STORAGE_KEY, String(streak)); } catch {}
};

const getFullName = (d: HistoricalDriver) => `${d.givenName} ${d.familyName}`;

export const HigherLower = () => {
    const { t } = useLanguage();
    const [drivers, setDrivers] = useState<HistoricalDriver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [currentDriver, setCurrentDriver] = useState<HistoricalDriver | null>(null);
    const [nextDriver, setNextDriver] = useState<HistoricalDriver | null>(null);
    const [currentStat, setCurrentStat] = useState<Stat>('totalWins');
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(loadBestStreak);
    const [isGameOver, setIsGameOver] = useState(false);
    const [lastWasCorrect, setLastWasCorrect] = useState<boolean | null>(null);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        fetchHistoricalDrivers()
            .then((data) => {
                setDrivers(data);
                const d1 = data[Math.floor(Math.random() * data.length)];
                let d2 = data[Math.floor(Math.random() * data.length)];
                const stat = STATS[Math.floor(Math.random() * STATS.length)].key;
                let attempts = 0;
                while (d2.driverId === d1.driverId && attempts < 20) {
                    d2 = data[Math.floor(Math.random() * data.length)];
                    attempts++;
                }
                while (getStatValue(d1, stat) === getStatValue(d2, stat) && attempts < 40) {
                    d2 = data[Math.floor(Math.random() * data.length)];
                    attempts++;
                }
                setCurrentDriver(d1);
                setNextDriver(d2);
                setCurrentStat(stat);
            })
            .catch((err: Error) => setError(err.message))
            .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pickRandom = useCallback((pool: HistoricalDriver[], exclude?: HistoricalDriver): HistoricalDriver => {
        const available = exclude ? pool.filter((d) => d.driverId !== exclude.driverId) : pool;
        return available[Math.floor(Math.random() * available.length)];
    }, []);

    const pickStat = (): Stat => {
        return STATS[Math.floor(Math.random() * STATS.length)].key;
    };

    const pickInitialDrivers = (pool: HistoricalDriver[]) => {
        const d1 = pickRandom(pool);
        let d2 = pickRandom(pool, d1);
        // Ensure different stat values for a meaningful comparison
        let attempts = 0;
        const stat = pickStat();
        while (getStatValue(d1, stat) === getStatValue(d2, stat) && attempts < 20) {
            d2 = pickRandom(pool, d1);
            attempts++;
        }
        setCurrentDriver(d1);
        setNextDriver(d2);
        setCurrentStat(stat);
    };

    const handleGuess = (guessedHigher: boolean) => {
        if (!currentDriver || !nextDriver || isGameOver) return;

        const currentValue = getStatValue(currentDriver, currentStat);
        const nextValue = getStatValue(nextDriver, currentStat);
        const actuallyHigher = nextValue > currentValue;
        const actuallyEqual = nextValue === currentValue;
        const isCorrect = actuallyEqual ? true : guessedHigher === actuallyHigher;

        setLastWasCorrect(isCorrect);
        setShowResult(true);

        if (isCorrect) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > bestStreak) {
                setBestStreak(newStreak);
                saveBestStreak(newStreak);
            }
            // Move next to current, pick new next
            setTimeout(() => {
                setCurrentDriver(nextDriver);
                const newStat = pickStat();
                setCurrentStat(newStat);
                let newNext = pickRandom(drivers, nextDriver);
                let tries = 0;
                while (getStatValue(nextDriver, newStat) === getStatValue(newNext, newStat) && tries < 30) {
                    newNext = pickRandom(drivers, nextDriver);
                    tries++;
                }
                setNextDriver(newNext);
                setShowResult(false);
                setLastWasCorrect(null);
            }, 600);
        } else {
            setIsGameOver(true);
        }
    };

    const handleNewGame = () => {
        setIsGameOver(false);
        setStreak(0);
        setShowResult(false);
        setLastWasCorrect(null);
        pickInitialDrivers(drivers);
    };

    const statIcon = STATS.find((s) => s.key === currentStat)?.icon;
    const resultTone = showResult ? (lastWasCorrect ? 'success' : 'danger') : 'neutral';

    return (
        <PageShell width="md">
            <PageHeader title={t.higherLower.title} subtitle={t.higherLower.mode} />

            {isLoading ? (
                <LoadingState label={t.higherLower.loading} />
            ) : error ? (
                <ErrorState title={t.search.dataErrorTitle} message={error} />
            ) : (
                <>
                    {/* Score board */}
                    {!isGameOver && (
                        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4">
                            <StatCard tone="accent" icon={<Zap className="h-4 w-4" />} label={t.higherLower.streak} value={streak} />
                            <StatCard tone="neutral" icon={<Trophy className="h-4 w-4" />} label={t.higherLower.bestStreak} value={bestStreak} />
                        </div>
                    )}

                    {/* Game over screen */}
                    {isGameOver && nextDriver && (
                        <Card padding="lg" className="mb-6">
                            <WinPanel
                                tone="danger"
                                icon={<Flag className="h-7 w-7 text-danger" />}
                                eyebrow={t.higherLower.gameOver}
                                title={getFullName(nextDriver)}
                                highlight={`${getStatLabel(currentStat, t)}: ${getStatValue(nextDriver, currentStat)}`}
                                stats={
                                    <div className="grid grid-cols-2 gap-3 text-left">
                                        <StatCard tone="accent" icon={<Zap className="h-4 w-4" />} label={t.higherLower.finalStreak} value={streak} />
                                        <StatCard tone="neutral" icon={<Trophy className="h-4 w-4" />} label={t.higherLower.bestStreak} value={bestStreak} />
                                    </div>
                                }
                                actions={
                                    <Button onClick={handleNewGame}>
                                        <RotateCcw className="h-4 w-4" />
                                        {t.higherLower.newGame}
                                    </Button>
                                }
                            />
                        </Card>
                    )}

                    {/* Driver cards */}
                    {!isGameOver && currentDriver && nextDriver && (
                        <>
                            {/* Stat indicator */}
                            <div className="mb-4 flex justify-center">
                                <Badge tone="neutral" size="md">
                                    {statIcon}
                                    {getStatLabel(currentStat, t)}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Current driver (revealed) */}
                                <Card tone={resultTone} className="text-center transition-colors duration-300">
                                    <p className="text-title3 text-foreground">{getFullName(currentDriver)}</p>
                                    <p className="mt-1 text-footnote text-secondary">{currentDriver.nationality}</p>
                                    <p className="mt-5 text-title2 text-foreground">{getStatValue(currentDriver, currentStat)}</p>
                                    <p className="mt-1 text-caption font-medium uppercase tracking-wide text-tertiary">
                                        {getStatLabel(currentStat, t)}
                                    </p>
                                </Card>

                                {/* Next driver (hidden) — the incoming card carries the streak's momentum */}
                                <motion.div
                                    key={nextDriver.driverId}
                                    initial={{ opacity: 0, x: 40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={springBouncy}
                                >
                                    <Card tone={resultTone} className="h-full text-center transition-colors duration-300">
                                        <p className="text-title3 text-foreground">{showResult ? getFullName(nextDriver) : '???'}</p>
                                        <p className="mt-1 text-footnote text-secondary">{showResult ? nextDriver.nationality : ' '}</p>
                                        <p
                                            className={`mt-5 text-title2 transition-colors duration-300 ${
                                                showResult ? (lastWasCorrect ? 'text-success' : 'text-danger') : 'text-tertiary'
                                            }`}
                                        >
                                            {showResult ? getStatValue(nextDriver, currentStat) : '?'}
                                        </p>
                                        <p className="mt-1 text-caption font-medium uppercase tracking-wide text-tertiary">
                                            {getStatLabel(currentStat, t)}
                                        </p>
                                    </Card>
                                </motion.div>
                            </div>

                            {/* Comparison indicator (fixed height to avoid layout jump) */}
                            <div className="mt-4 flex h-5 items-center justify-center">
                                {showResult && (
                                    lastWasCorrect ? (
                                        <span className="inline-flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-success">
                                            <TrendingUp className="h-3.5 w-3.5" /> Correct!
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-danger">
                                            <TrendingDown className="h-3.5 w-3.5" /> Wrong!
                                        </span>
                                    )
                                )}
                            </div>

                            {/* Higher / Lower buttons */}
                            <div className="mt-3 flex items-center justify-center gap-3">
                                <Button size="lg" onClick={() => handleGuess(true)} disabled={isGameOver || showResult}>
                                    <TrendingUp className="h-5 w-5" />
                                    {t.higherLower.higher}
                                </Button>
                                <Button size="lg" onClick={() => handleGuess(false)} disabled={isGameOver || showResult}>
                                    <TrendingDown className="h-5 w-5" />
                                    {t.higherLower.lower}
                                </Button>
                            </div>
                        </>
                    )}
                </>
            )}
        </PageShell>
    );
};
