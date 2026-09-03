import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SeasonChampion } from '../types';
import { fetchSeasonChampions, fetchTeams, TeamRecord } from '../api/f1dleApi';
import { useLanguage } from '../i18n/LanguageContext';
import { Lightbulb, SkipForward, CheckCircle, RotateCcw, Building2, XCircle } from 'lucide-react';
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

const STORAGE_KEY = 'f1dle-constructor-grid';

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
    } catch {}
    return defaultState();
};

const saveState = (state: GameState) => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
};

const clearState = () => {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
};

const historyRowTones: Record<Exclude<YearStatus, 'pending'>, string> = {
    found: 'border-success/25 bg-success/10',
    hint_found: 'border-warning/25 bg-warning/10',
    skipped: 'border-danger/25 bg-danger/10',
};

export const ConstructorGrid = () => {
    const { t } = useLanguage();

    const [champions, setChampions] = useState<SeasonChampion[]>([]);
    const [constructorNames, setConstructorNames] = useState<string[]>([]);
    const [teams, setTeams] = useState<Map<string, TeamRecord>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [gameState, setGameState] = useState<GameState>(loadState);
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [hintChampion, setHintChampion] = useState<SeasonChampion | null>(null);

    const noticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        Promise.all([fetchSeasonChampions(), fetchTeams()])
            .then(([champs, teamsList]) => {
                setChampions(champs);
                // Build constructor autocomplete pool from champions + current teams
                const fromChamps = champs.map((c) => c.constructor);
                const fromTeams = teamsList.map((t) => t.name);
                const unique = Array.from(new Set([...fromChamps, ...fromTeams])).sort();
                setConstructorNames(unique);

                const teamMap = new Map<string, TeamRecord>();
                teamsList.forEach((team) => teamMap.set(team.name, team));
                setTeams(teamMap);
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
        setHintChampion(null);
        showNotice('success', t.constructorGrid.found, 1500);
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
        setHintChampion(null);
    };

    const handleHint = () => {
        if (!currentChampion) return;
        setHintChampion(currentChampion);

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
        setHintChampion(null);
    };

    // Autosuggest
    const getSuggestions = (input: string) => {
        const inputValue = input.trim().toLowerCase();
        if (inputValue.length === 0) return [];
        return constructorNames.filter((name) =>
            name.toLowerCase().startsWith(inputValue)
        );
    };

    const onSuggestionsFetchRequested = ({ value: v }: { value: string }) => setSuggestions(getSuggestions(v));
    const onSuggestionsClearRequested = () => setSuggestions([]);
    const getSuggestionValue = (s: string) => s;

    const renderSuggestion = (suggestion: string) => {
        const teamRecord = teams.get(suggestion);
        return (
            <SuggestionShell>
                <div className="flex min-w-0 items-center gap-3">
                    {teamRecord?.logo_base64 ? (
                        <img
                            src={`data:${teamRecord.logo_mime_type};base64,${teamRecord.logo_base64}`}
                            alt={suggestion}
                            className="h-5 w-5 shrink-0 object-contain"
                        />
                    ) : (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-surface-raised text-caption font-semibold uppercase text-secondary">
                            {suggestion.slice(0, 2)}
                        </div>
                    )}
                    <span className="truncate text-footnote font-semibold text-foreground">{suggestion}</span>
                </div>
            </SuggestionShell>
        );
    };

    const submitGuess = (constructorName: string) => {
        if (!currentChampion || isGameComplete) return;

        const normalized = constructorName.trim().toLowerCase();
        const answerName = currentChampion.constructor.trim().toLowerCase();

        if (normalized === answerName) {
            handleCorrect(hintChampion !== null ? 'hint_found' : 'found');
        } else {
            updateGameState((prev) => ({ ...prev, errorsCount: prev.errorsCount + 1 }));
            showNotice('error', t.constructorGrid.wrong);
        }

        setValue('');
        setSuggestions([]);
    };

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const normalized = value.trim();
        if (!normalized) return;

        // Check if it's a known constructor
        const match = constructorNames.find((n) => n.toLowerCase() === normalized.toLowerCase());
        if (!match) {
            showNotice('error', t.search.invalidGuess);
            return;
        }
        submitGuess(match);
    };

    const onSuggestionSelected = (event: React.FormEvent<any>, data: { suggestion: string }) => {
        event.preventDefault();
        submitGuess(data.suggestion);
    };

    const inputProps = {
        placeholder: t.constructorGrid.constructorPlaceholder,
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
            <PageHeader title={t.constructorGrid.title} subtitle={t.constructorGrid.mode} />

            {isLoading ? (
                <LoadingState label={t.constructorGrid.loading} />
            ) : loadError ? (
                <ErrorState title={t.search.dataErrorTitle} message={loadError} />
            ) : (
                <>
                    {/* Hint modal */}
                    <Modal open={hintChampion !== null} onClose={() => setHintChampion(null)}>
                        {hintChampion && (
                            <>
                                <p className="text-caption font-medium uppercase tracking-wide text-tertiary">
                                    {t.constructorGrid.hintModalTitle}
                                </p>
                                <h2 className="mt-2 text-title2 text-foreground">
                                    {hintChampion.givenName} {hintChampion.familyName}
                                </h2>
                                <p className="mt-1 text-footnote text-secondary">
                                    {t.constructorGrid.driverChampion} · {hintChampion.nationality}
                                </p>

                                <div className="mt-5 grid grid-cols-2 gap-2">
                                    <Card tone="success" padding="sm">
                                        <p className="text-caption font-medium uppercase tracking-wide text-success">
                                            {t.constructorGrid.winsThisSeason}
                                        </p>
                                        <p className="mt-1 text-title3 text-foreground">{hintChampion.wins}</p>
                                    </Card>
                                    <Card tone="warning" padding="sm">
                                        <p className="text-caption font-medium uppercase tracking-wide text-warning">
                                            {t.constructorGrid.pointsThisSeason}
                                        </p>
                                        <p className="mt-1 text-title3 text-foreground">{hintChampion.points}</p>
                                    </Card>
                                </div>

                                <div className="mt-6 flex justify-end gap-2">
                                    <Button variant="secondary" size="sm" onClick={() => setHintChampion(null)}>
                                        {t.common.close}
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setHintChampion(null);
                                            handleSkip();
                                        }}
                                    >
                                        {t.constructorGrid.skip}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Modal>

                    <div className="flex flex-col gap-5">
                        {/* Score bar */}
                        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <StatCard
                                icon={<Building2 className="h-4 w-4" />}
                                label={t.constructorGrid.scoreFound}
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
                                label={t.constructorGrid.scoreHints}
                                value={gameState.hintsUsed}
                                tone="warning"
                            />
                            <StatCard
                                icon={<SkipForward className="h-4 w-4" />}
                                label={t.constructorGrid.scoreSkips}
                                value={gameState.skipsUsed}
                                tone="neutral"
                            />
                            <StatCard
                                icon={<XCircle className="h-4 w-4" />}
                                label={t.constructorGrid.scoreErrors}
                                value={gameState.errorsCount}
                                tone="danger"
                            />
                        </section>

                        {/* Game complete */}
                        {isGameComplete ? (
                            <Card padding="lg">
                                <WinPanel
                                    icon="🏆"
                                    title={t.constructorGrid.gameComplete}
                                    description={t.constructorGrid.gameCompleteDescription}
                                    stats={
                                        <div className="flex flex-wrap justify-center gap-2">
                                            <Badge tone="success" size="md">
                                                {scoreFound}/{champions.length} {t.constructorGrid.scoreFound.toLowerCase()}
                                            </Badge>
                                            <Badge tone="warning" size="md">
                                                {gameState.hintsUsed} {t.constructorGrid.scoreHints.toLowerCase()}
                                            </Badge>
                                            <Badge tone="neutral" size="md">
                                                {gameState.skipsUsed} {t.constructorGrid.scoreSkips.toLowerCase()}
                                            </Badge>
                                            <Badge tone="danger" size="md">
                                                {gameState.errorsCount} {t.constructorGrid.scoreErrors.toLowerCase()}
                                            </Badge>
                                        </div>
                                    }
                                    actions={
                                        <Button onClick={handleReset}>
                                            <RotateCcw className="h-4 w-4" />
                                            {t.constructorGrid.resetGame}
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
                                            {t.constructorGrid.currentYear}
                                        </p>
                                        <p className="mt-1 text-title1 text-foreground">{currentChampion.year}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="secondary" size="sm" onClick={handleHint}>
                                            <Lightbulb className="h-3.5 w-3.5" />
                                            {t.constructorGrid.hint}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={handleSkip}>
                                            <SkipForward className="h-3.5 w-3.5" />
                                            {t.constructorGrid.skip}
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
                                                        {champion.constructor}
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
                                    {t.constructorGrid.resetGame}
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </PageShell>
    );
};
