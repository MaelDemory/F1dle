import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { fetchRaceResults } from '../api/f1dleApi';
import { Race } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { Trophy, MapPin, Calendar, ChevronDown, Flag } from 'lucide-react';
import { Badge, Card, ErrorState, LoadingState, PageHeader, PageShell, StatCard } from '../components/ui';
import { spring } from '../lib/motion';

const CURRENT_YEAR = 2024;
const MIN_YEAR = 1950;

const years = Array.from({ length: CURRENT_YEAR - MIN_YEAR + 1 }, (_, i) => CURRENT_YEAR - i);

const formatDate = (dateStr: string, language: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const headerCellClasses = 'pb-2.5 pr-3 text-caption font-medium uppercase tracking-wide text-tertiary';

const getPodiumTone = (position: string): 'success' | 'neutral' | 'warning' | null => {
    if (position === '1') return 'success';
    if (position === '2') return 'neutral';
    if (position === '3') return 'warning';
    return null;
};

const RaceResults = () => {
    const { t, language } = useLanguage();
    const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
    const [races, setRaces] = useState<Race[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedRound, setExpandedRound] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError('');
        setExpandedRound(null);

        fetchRaceResults(selectedYear)
            .then((data) => {
                setRaces(data);
                setLoading(false);
            })
            .catch((err: Error) => {
                setRaces([]);
                setError(err.message);
                setLoading(false);
            });
    }, [selectedYear]);

    const uniqueWinners = new Set(
        races
            .filter((race) => race.Results.length > 0)
            .map((race) => race.Results[0].Driver.driverId)
    ).size;

    const uniqueCircuits = new Set(races.map((race) => race.Circuit.circuitId)).size;

    const toggleRound = (round: string) => {
        setExpandedRound((prev) => (prev === round ? null : round));
    };

    return (
        <PageShell width="lg">
            <PageHeader title={t.results.title} subtitle={t.results.subtitle} />

            {/* Year selector */}
            <div className="mb-6 flex items-center justify-center gap-3">
                <label
                    htmlFor="year-select"
                    className="text-caption font-medium uppercase tracking-wide text-tertiary"
                >
                    {t.results.selectYear}
                </label>
                <select
                    id="year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="rounded-md border border-border bg-surface px-3 py-2 text-footnote font-semibold text-foreground outline-none transition focus:border-accent/60 focus:ring-4 focus:ring-accent/10"
                >
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <LoadingState className="min-h-[40vh] justify-center" />
            ) : error ? (
                <ErrorState title={t.search.dataErrorTitle} message={error || t.results.loadingError} />
            ) : races.length === 0 ? (
                <Card padding="lg" className="text-center">
                    <p className="text-footnote text-secondary">{t.results.noResults}</p>
                </Card>
            ) : (
                <div className="space-y-5">
                    {/* Stats row */}
                    <section className="grid gap-3 sm:grid-cols-3">
                        <StatCard icon={<Flag className="h-4 w-4" />} label={t.results.totalRaces} value={races.length} />
                        <StatCard icon={<Trophy className="h-4 w-4" />} label={t.results.differentWinners} value={uniqueWinners} tone="accent" />
                        <StatCard icon={<MapPin className="h-4 w-4" />} label={t.results.circuits} value={uniqueCircuits} />
                    </section>

                    {/* Race accordion */}
                    <section className="space-y-3">
                        {races.map((race) => {
                            const isExpanded = expandedRound === race.round;
                            const winner = race.Results[0];

                            return (
                                <Card key={race.round} padding="none" className="overflow-hidden">
                                    {/* Collapsed header */}
                                    <button
                                        type="button"
                                        onClick={() => toggleRound(race.round)}
                                        aria-expanded={isExpanded}
                                        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-surface-raised/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40 sm:p-5"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-raised">
                                            <span className="text-caption font-semibold text-secondary">
                                                R{race.round}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-callout font-semibold text-foreground">
                                                {race.raceName}
                                            </h2>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-footnote text-secondary">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                                                    {race.Circuit.Location.locality}, {race.Circuit.Location.country}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                                                    {formatDate(race.date, language)}
                                                </span>
                                            </div>
                                        </div>

                                        {winner && (
                                            <Badge tone="success" size="md" className="hidden shrink-0 sm:inline-flex">
                                                <Trophy className="h-3 w-3" aria-hidden="true" />
                                                <span className="sr-only">{t.results.winner}</span>
                                                {winner.Driver.givenName.charAt(0)}. {winner.Driver.familyName}
                                            </Badge>
                                        )}

                                        <motion.span
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={spring}
                                            className="shrink-0 text-tertiary"
                                        >
                                            <ChevronDown className="h-5 w-5" aria-hidden="true" />
                                        </motion.span>
                                    </button>

                                    {/* Expanded results table */}
                                    <AnimatePresence initial={false}>
                                        {isExpanded && race.Results.length > 0 && (
                                            <motion.div
                                                key="results"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={spring}
                                                className="overflow-hidden"
                                            >
                                                <div className="border-t border-border px-4 pb-4 sm:px-5 sm:pb-5">
                                                    <div className="mt-4 overflow-x-auto">
                                                        <table className="w-full text-left">
                                                            <thead>
                                                                <tr>
                                                                    <th className={headerCellClasses}>{t.results.position}</th>
                                                                    <th className={headerCellClasses}>{t.results.driver}</th>
                                                                    <th className={`hidden sm:table-cell ${headerCellClasses}`}>{t.results.team}</th>
                                                                    <th className={`hidden md:table-cell ${headerCellClasses}`}>{t.results.grid}</th>
                                                                    <th className={`hidden md:table-cell ${headerCellClasses}`}>{t.results.laps}</th>
                                                                    <th className={headerCellClasses}>{t.results.time}/{t.results.status}</th>
                                                                    <th className={`hidden sm:table-cell ${headerCellClasses}`}>{t.results.fastestLap}</th>
                                                                    <th className="pb-2.5 text-right text-caption font-medium uppercase tracking-wide text-tertiary">
                                                                        {t.results.points}
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {race.Results.map((result) => {
                                                                    const podiumTone = getPodiumTone(result.position);
                                                                    const hasFastestLap = result.FastestLap?.rank === '1';

                                                                    return (
                                                                        <tr
                                                                            key={result.position}
                                                                            className={`border-t border-border ${podiumTone === 'success' ? 'bg-success/5' : ''}`}
                                                                        >
                                                                            <td className="py-2.5 pr-3">
                                                                                {podiumTone ? (
                                                                                    <Badge tone={podiumTone}>{result.positionText}</Badge>
                                                                                ) : (
                                                                                    <span className="text-footnote font-medium text-tertiary">
                                                                                        {result.positionText}
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                            <td className="py-2.5 pr-3">
                                                                                <span className="text-footnote font-semibold text-foreground">
                                                                                    {result.Driver.givenName.charAt(0)}. {result.Driver.familyName}
                                                                                </span>
                                                                                {hasFastestLap && (
                                                                                    <Badge tone="accent" className="ml-1.5">FL</Badge>
                                                                                )}
                                                                            </td>
                                                                            <td className="hidden py-2.5 pr-3 text-footnote text-secondary sm:table-cell">
                                                                                {result.Constructor.name}
                                                                            </td>
                                                                            <td className="hidden py-2.5 pr-3 text-footnote text-secondary md:table-cell">
                                                                                {result.grid}
                                                                            </td>
                                                                            <td className="hidden py-2.5 pr-3 text-footnote text-secondary md:table-cell">
                                                                                {result.laps}
                                                                            </td>
                                                                            <td className="py-2.5 pr-3 text-footnote text-secondary">
                                                                                {result.Time?.time || result.status}
                                                                            </td>
                                                                            <td className="hidden py-2.5 pr-3 sm:table-cell">
                                                                                {result.FastestLap?.Time?.time ? (
                                                                                    <span className={`text-footnote ${hasFastestLap ? 'font-medium text-accent' : 'text-secondary'}`}>
                                                                                        {result.FastestLap.Time.time}
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="text-footnote text-tertiary">—</span>
                                                                                )}
                                                                            </td>
                                                                            <td className="py-2.5 text-right">
                                                                                <span className="text-footnote font-semibold text-foreground">
                                                                                    {result.points}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            );
                        })}
                    </section>
                </div>
            )}
        </PageShell>
    );
};

export default RaceResults;
