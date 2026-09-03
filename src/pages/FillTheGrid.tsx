import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { HistoricalDriver, SeasonChampion } from '../types';
import { fetchSeasonChampions, fetchHistoricalDrivers } from '../api/f1dleApi';
import { useLanguage } from '../i18n/LanguageContext';
import { Trophy, Lightbulb, SkipForward, CheckCircle, RotateCcw, XCircle } from 'lucide-react';
import {
    Badge,
    Button,
    Card,
    ErrorState,
    LoadingState,
    Modal,
    PageShell,
    PageHeader,
    SearchField,
    StatCard,
    SuggestionShell,
    WinPanel,
} from '../components/ui';
import { spring } from '../lib/motion';
import { cn } from '../lib/utils';

const STORAGE_KEY = 'f1dle-fill-the-grid';

type YearStatus = 'pending' | 'found' | 'hint_found' | 'skipped';

interface GameState {
    currentYearIndex: number;
    yearStatuses: Record<number, YearStatus>;
    hintsUsed: number;
    skipsUsed: number;
    errorsCount: number;
}

const defaultState = (): GameState => ({
    currentYearIndex: 0,
    yearStatuses: {},
    hintsUsed: 0,
    skipsUsed: 0,
    errorsCount: 0,
});

const loadState = (): GameState => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as GameState;
    } catch {
        // ignore
    }
    return defaultState();
};

const saveState = (state: GameState) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // ignore
    }
};

const clearState = () => {
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore
    }
};

const getFullName = (driver: HistoricalDriver) => `${driver.givenName} ${driver.familyName}`;

const historyRowTones: Record<Exclude<YearStatus, 'pending'>, string> = {
    found: 'border-success/25 bg-success/10',
    hint_found: 'border-warning/25 bg-warning/10',
    skipped: 'border-danger/25 bg-danger/10',
};

export const FillTheGrid = () => {
    const { t } = useLanguage();

    const [champions, setChampions] = useState<SeasonChampion[]>([]);
    const [allDrivers, setAllDrivers] = useState<HistoricalDriver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [gameState, setGameState] = useState<GameState>(loadState);
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState<HistoricalDriver[]>([]);
    const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [hintDriver, setHintDriver] = useState<{ champion: SeasonChampion; historical: HistoricalDriver | null } | null>(null);

    const noticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        Promise.all([fetchSeasonChampions(), fetchHistoricalDrivers()])
            .then(([champs, drivers]) => {
                setChampions(champs);
                setAllDrivers(drivers);
            })
            .catch((err: Error) => setLoadError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    const currentChampion = champions[gameState.currentYearIndex] ?? null;
    const isGameComplete = champions.length > 0 && gameState.currentYearIndex >= champions.length;

    const scoreFound = useMemo(
        () => Object.values(gameState.yearStatuses).filter((s) => s === 'found' || s === 'hint_found').length,
        [gameState.yearStatuses]
    );

    const recentHistory = useMemo(() => {
        const answered = Object.entries(gameState.yearStatuses)
            .map(([year, status]) => ({ year: Number(year), status }))
            .sort((a, b) => a.year - b.year)
            .slice(0, 5);

        return answered.map(({ year, status }) => {
            const champ = champions.find((c) => c.year === year);
            return { year, status, champion: champ };
        });
    }, [gameState.yearStatuses, champions]);

    const updateGameState = (updater: (prev: GameState) => GameState) => {
        setGameState((prev) => {
            const next = updater(prev);
            saveState(next);
            return next;
        });
    };

    const showNotice = (type: 'success' | 'error' | 'info', text: string, duration = 2000) => {
        if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
        setNotice({ type, text });
        if (duration > 0) {
            noticeTimeoutRef.current = setTimeout(() => setNotice(null), duration);
        }
    };

    const handleCorrect = (status: 'found' | 'hint_found') => {
        if (!currentChampion) return;

        updateGameState((prev) => ({
            ...prev,
            yearStatuses: { ...prev.yearStatuses, [currentChampion.year]: status },
            currentYearIndex: prev.currentYearIndex + 1,
        }));

        setValue('');
        setSuggestions([]);
        setHintDriver(null);
        showNotice('success', t.fillTheGrid.found, 1500);
    };

    const handleSkip = () => {
        if (!currentChampion) return;

        updateGameState((prev) => ({
            ...prev,
            yearStatuses: { ...prev.yearStatuses, [currentChampion.year]: 'skipped' },
            skipsUsed: prev.skipsUsed + 1,
            currentYearIndex: prev.currentYearIndex + 1,
        }));

        setValue('');
        setSuggestions([]);
        setNotice(null);
        setHintDriver(null);
    };

    const handleHint = () => {
        if (!currentChampion) return;

        const historical = allDrivers.find((d) => d.driverId === currentChampion.driverId) ?? null;
        setHintDriver({ champion: currentChampion, historical });

        updateGameState((prev) => ({
            ...prev,
            hintsUsed: prev.hintsUsed + 1,
        }));
    };

    const handleReset = () => {
        clearState();
        setGameState(defaultState());
        setValue('');
        setSuggestions([]);
        setNotice(null);
        setHintDriver(null);
    };

    // Autosuggest
    const getSuggestions = (input: string) => {
        const inputValue = input.trim().toLowerCase();
        if (inputValue.length === 0) return [];

        return allDrivers.filter((driver) =>
            driver.familyName.toLowerCase().startsWith(inputValue) ||
            driver.givenName.toLowerCase().startsWith(inputValue) ||
            getFullName(driver).toLowerCase().startsWith(inputValue)
        );
    };

    const onSuggestionsFetchRequested = ({ value }: { value: string }) => setSuggestions(getSuggestions(value));
    const onSuggestionsClearRequested = () => setSuggestions([]);
    const getSuggestionValue = (s: HistoricalDriver) => getFullName(s);

    const renderSuggestion = (suggestion: HistoricalDriver) => (
        <SuggestionShell>
            <div className="min-w-0">
                <p className="truncate text-footnote font-semibold text-foreground">{getFullName(suggestion)}</p>
                <p className="mt-0.5 text-caption text-tertiary">
                    {suggestion.nationality} · {suggestion.totalWins} {t.drivers.wins}
                </p>
            </div>
            {suggestion.championships > 0 && (
                <Badge tone="warning">
                    <Trophy className="h-3 w-3" />
                    {suggestion.championships}
                </Badge>
            )}
        </SuggestionShell>
    );

    const submitGuess = (driver: HistoricalDriver) => {
        if (!currentChampion || isGameComplete) return;

        if (driver.driverId === currentChampion.driverId) {
            handleCorrect(hintDriver !== null ? 'hint_found' : 'found');
        } else {
            updateGameState((prev) => ({ ...prev, errorsCount: prev.errorsCount + 1 }));
            showNotice('error', t.fillTheGrid.wrong);
        }

        setValue('');
        setSuggestions([]);
    };

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const normalized = value.trim().toLowerCase();
        const driver = allDrivers.find((d) => getFullName(d).toLowerCase() === normalized);
        if (!driver) {
            showNotice('error', t.search.invalidGuess);
            return;
        }
        submitGuess(driver);
    };

    const onSuggestionSelected = (event: React.FormEvent<any>, data: { suggestion: HistoricalDriver }) => {
        event.preventDefault();
        submitGuess(data.suggestion);
    };

    const inputProps = {
        placeholder: t.fillTheGrid.placeholder,
        value,
        onChange: (_: any, { newValue }: { newValue: string }) => {
            setValue(newValue);
            setNotice(null);
        },
        disabled: isGameComplete,
    };

    const noticeTone = { success: 'success', error: 'danger', info: 'neutral' } as const;
    const noticeText = {
        success: 'text-success',
        error: 'text-danger',
        info: 'text-secondary',
    };

    return (
        <PageShell width="md">
            <PageHeader title={t.fillTheGrid.title} subtitle={t.fillTheGrid.mode} />

            {isLoading ? (
                <LoadingState label={t.fillTheGrid.loading} />
            ) : loadError ? (
                <ErrorState title={t.search.dataErrorTitle} message={loadError} />
            ) : (
                <>
                    {/* Hint modal */}
                    <Modal open={hintDriver !== null} onClose={() => setHintDriver(null)}>
                        {hintDriver && (
                            <>
                                <p className="text-caption font-medium uppercase tracking-wide text-tertiary">
                                    {t.fillTheGrid.hintModalTitle}
                                </p>
                                <h2 className="mt-2 text-title2 text-foreground">{hintDriver.champion.constructor}</h2>
                                <p className="mt-1 text-footnote text-secondary">
                                    {t.fillTheGrid.constructor} · {hintDriver.champion.nationality} · {hintDriver.champion.year}
                                </p>

                                {/* Season stats */}
                                <div className="mt-5 grid grid-cols-2 gap-2">
                                    <Card tone="success" padding="sm">
                                        <p className="text-caption font-medium uppercase tracking-wide text-success">
                                            {t.fillTheGrid.winsThisSeason}
                                        </p>
                                        <p className="mt-1 text-title3 text-foreground">{hintDriver.champion.wins}</p>
                                    </Card>
                                    <Card tone="warning" padding="sm">
                                        <p className="text-caption font-medium uppercase tracking-wide text-warning">
                                            {t.fillTheGrid.pointsThisSeason}
                                        </p>
                                        <p className="mt-1 text-title3 text-foreground">{hintDriver.champion.points}</p>
                                    </Card>
                                </div>

                                {/* Career stats from historical */}
                                {hintDriver.historical && (
                                    <div className="mt-4">
                                        <p className="mb-2 text-caption font-medium uppercase tracking-wide text-tertiary">
                                            {t.fillTheGrid.careerStats}
                                        </p>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="rounded-md border border-border bg-surface-raised px-3 py-2.5">
                                                <p className="text-caption font-medium uppercase tracking-wide text-tertiary">{t.drivers.wins}</p>
                                                <p className="mt-1 text-title3 text-foreground">{hintDriver.historical.totalWins}</p>
                                            </div>
                                            <div className="rounded-md border border-border bg-surface-raised px-3 py-2.5">
                                                <p className="text-caption font-medium uppercase tracking-wide text-tertiary">{t.drivers.titles}</p>
                                                <p className="mt-1 text-title3 text-foreground">{hintDriver.historical.championships}</p>
                                            </div>
                                            <div className="rounded-md border border-border bg-surface-raised px-3 py-2.5">
                                                <p className="text-caption font-medium uppercase tracking-wide text-tertiary">{t.drivers.seasons}</p>
                                                <p className="mt-1 text-title3 text-foreground">{hintDriver.historical.seasonsActive}</p>
                                            </div>
                                        </div>
                                        {hintDriver.historical.teamsHistory.length > 0 && (
                                            <div className="mt-4">
                                                <p className="mb-2 text-caption font-medium uppercase tracking-wide text-tertiary">
                                                    {t.drivers.lastTeam}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {hintDriver.historical.teamsHistory.map((team, i) => (
                                                        <Badge key={i}>{team}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end gap-2">
                                    <Button variant="secondary" size="sm" onClick={() => setHintDriver(null)}>
                                        {t.common.close}
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setHintDriver(null);
                                            handleSkip();
                                        }}
                                    >
                                        {t.fillTheGrid.skip}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Modal>

                    <div className="flex flex-col gap-5">
                        {/* Score bar */}
                        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <StatCard
                                icon={<CheckCircle className="h-4 w-4" />}
                                label={t.fillTheGrid.scoreFound}
                                value={
                                    <>
                                        {scoreFound}
                                        <span className="text-footnote text-tertiary">/{champions.length}</span>
                                    </>
                                }
                                tone="success"
                            />
                            <StatCard
                                icon={<Lightbulb className="h-4 w-4" />}
                                label={t.fillTheGrid.scoreHints}
                                value={gameState.hintsUsed}
                                tone="warning"
                            />
                            <StatCard
                                icon={<SkipForward className="h-4 w-4" />}
                                label={t.fillTheGrid.scoreSkips}
                                value={gameState.skipsUsed}
                                tone="neutral"
                            />
                            <StatCard
                                icon={<XCircle className="h-4 w-4" />}
                                label={t.fillTheGrid.scoreErrors}
                                value={gameState.errorsCount}
                                tone="danger"
                            />
                        </section>

                        {/* Game complete */}
                        {isGameComplete ? (
                            <Card padding="lg">
                                <WinPanel
                                    icon="🏆"
                                    title={t.fillTheGrid.gameComplete}
                                    description={t.fillTheGrid.gameCompleteDescription}
                                    stats={
                                        <div className="flex flex-wrap justify-center gap-2">
                                            <Badge tone="success" size="md">
                                                {scoreFound}/{champions.length} {t.fillTheGrid.scoreFound.toLowerCase()}
                                            </Badge>
                                            <Badge tone="warning" size="md">
                                                {gameState.hintsUsed} {t.fillTheGrid.scoreHints.toLowerCase()}
                                            </Badge>
                                            <Badge tone="neutral" size="md">
                                                {gameState.skipsUsed} {t.fillTheGrid.scoreSkips.toLowerCase()}
                                            </Badge>
                                            <Badge tone="danger" size="md">
                                                {gameState.errorsCount} {t.fillTheGrid.scoreErrors.toLowerCase()}
                                            </Badge>
                                        </div>
                                    }
                                    actions={
                                        <Button onClick={handleReset}>
                                            <RotateCcw className="h-4 w-4" />
                                            {t.fillTheGrid.resetGame}
                                        </Button>
                                    }
                                />
                            </Card>
                        ) : currentChampion ? (
                            /* Current year panel */
                            <Card className="relative z-10">
                                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-caption font-medium uppercase tracking-wide text-tertiary">
                                            {t.fillTheGrid.currentYear}
                                        </p>
                                        <p className="mt-1 text-title1 text-foreground">{currentChampion.year}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="secondary" size="sm" onClick={handleHint}>
                                            <Lightbulb className="h-3.5 w-3.5" />
                                            {t.fillTheGrid.hint}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={handleSkip}>
                                            <SkipForward className="h-3.5 w-3.5" />
                                            {t.fillTheGrid.skip}
                                        </Button>
                                    </div>
                                </div>

                                <form onSubmit={onSubmit} className="space-y-4">
                                    <SearchField
                                        suggestions={suggestions}
                                        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                                        onSuggestionsClearRequested={onSuggestionsClearRequested}
                                        onSuggestionSelected={onSuggestionSelected}
                                        getSuggestionValue={getSuggestionValue}
                                        renderSuggestion={renderSuggestion}
                                        inputProps={inputProps}
                                    />

                                    <div className="flex justify-center">
                                        <Button type="submit" disabled={isGameComplete}>
                                            {t.common.guess}
                                        </Button>
                                    </div>
                                </form>

                                {notice && (
                                    <Card
                                        tone={noticeTone[notice.type]}
                                        padding="sm"
                                        className={cn('mt-4 text-center text-footnote font-medium', noticeText[notice.type])}
                                    >
                                        {notice.text}
                                    </Card>
                                )}
                            </Card>
                        ) : null}

                        {/* Recent history */}
                        {recentHistory.length > 0 && (
                            <Card>
                                <p className="mb-4 text-caption font-medium uppercase tracking-wide text-tertiary">
                                    {Object.keys(gameState.yearStatuses).length} / {champions.length} saisons
                                </p>
                                <div className="space-y-2">
                                    {recentHistory.map(({ year, status, champion }) => (
                                        <motion.div
                                            key={year}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={spring}
                                            className={cn(
                                                'flex items-center justify-between rounded-md border px-4 py-3',
                                                historyRowTones[status as Exclude<YearStatus, 'pending'>]
                                            )}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="text-footnote font-semibold text-secondary">{year}</span>
                                                {champion && (
                                                    <span className="truncate text-footnote text-foreground">
                                                        {champion.givenName} {champion.familyName}
                                                    </span>
                                                )}
                                            </div>
                                            {status === 'found' && <CheckCircle className="h-4 w-4 shrink-0 text-success" />}
                                            {status === 'hint_found' && <Lightbulb className="h-4 w-4 shrink-0 text-warning" />}
                                            {status === 'skipped' && <SkipForward className="h-4 w-4 shrink-0 text-danger" />}
                                        </motion.div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Reset button */}
                        {!isGameComplete && Object.keys(gameState.yearStatuses).length > 0 && (
                            <div className="text-center">
                                <Button variant="ghost" size="sm" onClick={handleReset}>
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    {t.fillTheGrid.resetGame}
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </PageShell>
    );
};
