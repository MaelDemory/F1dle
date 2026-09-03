import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { fetchDrivers, fetchTeams, TeamRecord } from '../api/f1dleApi';
import { Driver, HistoricalDriver } from '../types';
import { Pagination } from '../components';
import { DriverDetailCard } from '../components/drivers/DriverDetailCard';
import { currentDriverDetail, historicalDriverDetail } from '../drivers/detail';
import {
    Badge,
    Button,
    Card,
    ErrorState,
    LoadingState,
    PageHeader,
    PageShell,
    SegmentedControl,
    StatCard,
} from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';
import { Trophy, Users, Flag, Globe, Search } from 'lucide-react';
import { useHistoricalDrivers } from '../hooks/useHistoricalDrivers';
import { staggerContainer, staggerItem } from '../lib/motion';

type ViewMode = 'current' | 'alltime';
type SortField = 'wins' | 'points' | 'seasons';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 30;

const MotionCard = motion.create(Card);

const inputClasses =
    'w-full rounded-md border border-border bg-surface py-3 pl-11 pr-4 text-callout text-foreground placeholder:text-tertiary outline-none transition focus:border-accent/60 focus:ring-4 focus:ring-accent/10';

const selectClasses =
    'rounded-md border border-border bg-surface px-3 py-2 text-footnote font-medium text-secondary outline-none transition focus:border-accent/60';

const filterChipClasses = (active: boolean) =>
    `rounded-md border px-3 py-2 text-footnote font-medium transition-colors ${
        active
            ? 'border-accent/30 bg-accent/10 text-accent'
            : 'border-border bg-surface text-secondary hover:bg-surface-raised hover:text-foreground'
    }`;

const getTeamLogoSrc = (driver: Driver) => {
    if (!driver.team_logo_base64 || !driver.team_logo_mime_type) return null;
    return `data:${driver.team_logo_mime_type};base64,${driver.team_logo_base64}`;
};

const getDriverInitials = (driver: HistoricalDriver) => {
    if (driver.code) return driver.code;
    return `${driver.givenName[0]}${driver.familyName[0]}`.toUpperCase();
};

const getDecade = (year: number) => Math.floor(year / 10) * 10;

const Drivers = () => {
    const { t, language } = useLanguage();
    const [viewMode, setViewMode] = useState<ViewMode>('current');
    const [currentDrivers, setCurrentDrivers] = useState<Driver[]>([]);
    const [query, setQuery] = useState('');
    const [loadError, setLoadError] = useState('');
    const [page, setPage] = useState(1);
    const [gridEntered, setGridEntered] = useState(false);

    // All-time filters
    const [nationalityFilter, setNationalityFilter] = useState('');
    const [decadeFilter, setDecadeFilter] = useState('');
    const [championsOnly, setChampionsOnly] = useState(false);
    const [winnersOnly, setWinnersOnly] = useState(false);
    const [sortField, setSortField] = useState<SortField>('wins');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [teamRecords, setTeamRecords] = useState<Map<string, TeamRecord>>(new Map());
    // One selection for both shapes: which record is open, and which adapter
    // reads it. Storing the raw record rather than the adapted detail keeps the
    // translated labels current when the language changes while the card is open.
    const [selected, setSelected] = useState<
        { kind: 'current'; driver: Driver } | { kind: 'historical'; driver: HistoricalDriver } | null
    >(null);

    const detailLabels = useMemo(
        () => ({
            wins: t.drivers.wins,
            titles: t.drivers.titles,
            podiums: t.drivers.podiums,
            poles: t.drivers.poles,
            points: t.drivers.points,
            entries: t.drivers.entries,
            fastestLaps: t.drivers.fastestLaps,
            seasons: t.drivers.seasons,
            firstEntry: t.drivers.firstEntry,
            lastSeason: t.drivers.lastSeason,
            lastTeam: t.drivers.lastTeam,
            birthDate: t.drivers.birthDate,
            nationality: t.drivers.nationality,
            code: t.drivers.code,
            careerSpan: t.drivers.careerSpan
        }),
        [t]
    );

    const { drivers: historicalDrivers, loading: histLoading, progress, error: histError } = useHistoricalDrivers(viewMode === 'alltime');

    useEffect(() => {
        fetchDrivers()
            .then((data) => {
                setCurrentDrivers(data.sort((a, b) => b.win - a.win));
                setLoadError('');
            })
            .catch((requestError: Error) => {
                setCurrentDrivers([]);
                setLoadError(requestError.message);
            });

        fetchTeams()
            .then((teams) => {
                const map = new Map<string, TeamRecord>();
                for (const team of teams) {
                    map.set(team.name, team);
                }
                setTeamRecords(map);
            })
            .catch(() => {});
    }, []);

    // Reset page when filters/sort change
    useEffect(() => {
        setPage(1);
    }, [query, nationalityFilter, decadeFilter, championsOnly, winnersOnly, sortField, sortDirection, viewMode]);

    // Current grid filtering
    const normalizedQuery = query.trim().toLowerCase();
    const filteredCurrentDrivers = currentDrivers.filter((driver) => {
        if (!normalizedQuery) return true;
        const haystack = [
            `${driver.surname} ${driver.name}`,
            driver.team,
            driver.nationality,
            String(driver.driver_number)
        ].join(' ').toLowerCase();
        return haystack.includes(normalizedQuery);
    });

    // All-time filtering + sorting
    const filteredHistorical = useMemo(() => {
        const sortKeys: Record<SortField, keyof HistoricalDriver> = {
            wins: 'totalWins',
            points: 'totalPoints',
            seasons: 'seasonsActive',
        };

        return historicalDrivers
            .filter((driver) => {
                if (normalizedQuery) {
                    const haystack = [
                        `${driver.givenName} ${driver.familyName}`,
                        driver.nationality,
                        driver.code ?? '',
                        driver.lastTeam ?? '',
                    ].join(' ').toLowerCase();
                    if (!haystack.includes(normalizedQuery)) return false;
                }
                if (nationalityFilter && driver.nationality !== nationalityFilter) return false;
                if (decadeFilter && getDecade(driver.firstSeason) !== Number(decadeFilter)) return false;
                if (championsOnly && driver.championships === 0) return false;
                if (winnersOnly && driver.totalWins === 0) return false;
                return true;
            })
            .sort((a, b) => {
                const key = sortKeys[sortField];
                const aVal = a[key] as number;
                const bVal = b[key] as number;
                return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
            });
    }, [historicalDrivers, normalizedQuery, nationalityFilter, decadeFilter, championsOnly, winnersOnly, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredHistorical.length / ITEMS_PER_PAGE);
    const paginatedHistorical = filteredHistorical.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    // Unique values for filter dropdowns
    const uniqueNationalities = useMemo(() => {
        const nats = new Set(historicalDrivers.map((d) => d.nationality));
        return Array.from(nats).sort();
    }, [historicalDrivers]);

    const uniqueDecades = useMemo(() => {
        const decades = new Set(
            historicalDrivers
                .filter((d) => d.firstSeason > 0)
                .map((d) => getDecade(d.firstSeason))
        );
        return Array.from(decades).sort();
    }, [historicalDrivers]);

    // Stats
    const totalTeams = new Set(currentDrivers.map((d) => d.team)).size;
    const totalChampionsCurrent = currentDrivers.filter((d) => d.world_championship > 0).length;
    const totalNationalities = uniqueNationalities.length;
    const totalChampionsAllTime = historicalDrivers.filter((d) => d.championships > 0).length;

    const isAllTime = viewMode === 'alltime';

    // Mark the grid entrance as done after the first grid render so pagination
    // and view switches don't re-stagger.
    useEffect(() => {
        if (gridEntered) return;
        if ((!isAllTime && filteredCurrentDrivers.length > 0) || (isAllTime && paginatedHistorical.length > 0)) {
            setGridEntered(true);
        }
    }, [gridEntered, isAllTime, filteredCurrentDrivers.length, paginatedHistorical.length]);

    const gridMotionProps = {
        variants: staggerContainer(0.04),
        initial: gridEntered ? false : ('hidden' as const),
        animate: 'visible' as const,
    };

    return (
        <>
        <PageShell width="xl">
            <PageHeader
                title={t.drivers.title}
                subtitle={isAllTime ? t.drivers.allTimeSubtitle : t.drivers.subtitle}
            />

            <div className="mb-6 flex justify-center">
                <SegmentedControl<ViewMode>
                    options={[
                        { value: 'current', label: t.drivers.currentGridTab },
                        { value: 'alltime', label: t.drivers.allTimeTab },
                    ]}
                    value={viewMode}
                    onChange={setViewMode}
                />
            </div>

            {/* ========== CURRENT GRID VIEW ========== */}
            {!isAllTime && (
                <>
                    {!currentDrivers.length && !loadError ? (
                        <LoadingState className="min-h-[40vh] justify-center" />
                    ) : loadError ? (
                        <ErrorState title={t.search.dataErrorTitle} message={loadError || t.drivers.loadingError} />
                    ) : (
                        <div className="space-y-5">
                            {/* Stats row */}
                            <section className="grid gap-3 sm:grid-cols-3">
                                <StatCard icon={<Users className="h-4 w-4" />} label={t.drivers.totalDrivers} value={currentDrivers.length} />
                                <StatCard icon={<Flag className="h-4 w-4" />} label={t.drivers.teams} value={totalTeams} />
                                <StatCard icon={<Trophy className="h-4 w-4" />} label={t.drivers.champions} value={totalChampionsCurrent} tone="accent" />
                            </section>

                            {/* Search */}
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-tertiary">
                                    <Search className="h-4 w-4" strokeWidth={2} />
                                </div>
                                <input
                                    id="driver-search"
                                    type="text"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder={t.drivers.searchPlaceholder}
                                    className={inputClasses}
                                />
                            </div>

                            {/* Driver grid */}
                            {filteredCurrentDrivers.length === 0 ? (
                                <Card padding="lg" className="text-center">
                                    <p className="text-footnote text-secondary">{t.drivers.emptyState}</p>
                                </Card>
                            ) : (
                                <motion.section {...gridMotionProps} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {filteredCurrentDrivers.map((driver) => {
                                        const teamLogoSrc = getTeamLogoSrc(driver);

                                        return (
                                            <MotionCard
                                                key={driver.id_driver}
                                                variants={staggerItem}
                                                padding="sm"
                                                className="relative transition-colors hover:bg-surface-raised"
                                            >
                                                {/*
                                                  An overlay button rather than a wrapper: <button> cannot
                                                  legally contain the heading below, and a div with
                                                  role="button" would re-create a native control. This keeps
                                                  the whole card as one large, keyboard-reachable target with
                                                  a screen-reader name.
                                                */}
                                                <button
                                                    type="button"
                                                    onClick={() => setSelected({ kind: 'current', driver })}
                                                    aria-label={`${driver.surname} ${driver.name} — ${t.drivers.profile}`}
                                                    className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                                />
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex min-w-0 items-start gap-3">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-raised p-1.5">
                                                            {teamLogoSrc ? (
                                                                <img
                                                                    src={teamLogoSrc}
                                                                    alt={`${driver.team} logo`}
                                                                    className="h-9 w-9 object-contain"
                                                                />
                                                            ) : (
                                                                <span className="text-caption font-medium text-tertiary">N/A</span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-caption font-medium uppercase tracking-wide text-tertiary">{driver.team}</p>
                                                            <h2 className="mt-0.5 text-title3 text-foreground">
                                                                {driver.surname} {driver.name}
                                                            </h2>
                                                            <p className="mt-0.5 text-footnote text-secondary">{driver.nationality}</p>
                                                        </div>
                                                    </div>
                                                    <span className="shrink-0 text-footnote font-semibold text-tertiary">#{driver.driver_number}</span>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-1.5">
                                                    <Badge tone="success">{t.drivers.wins} {driver.win}</Badge>
                                                    <Badge tone="accent">{t.drivers.titles} {driver.world_championship}</Badge>
                                                    <Badge>{t.drivers.entries} {driver.entries}</Badge>
                                                    <Badge>{t.drivers.firstEntry} {driver.first_entry}</Badge>
                                                    <Badge>{t.drivers.points} {driver.career_points}</Badge>
                                                </div>
                                            </MotionCard>
                                        );
                                    })}
                                </motion.section>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ========== ALL-TIME VIEW ========== */}
            {isAllTime && (
                <>
                    {histLoading && !historicalDrivers.length ? (
                        <div className="flex min-h-[40vh] flex-col items-center justify-center">
                            <LoadingState label={t.drivers.loadingHistory} />
                            {progress.total > 0 && (
                                <div className="mt-2 w-48 space-y-2 text-center">
                                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
                                        <div
                                            className="h-full rounded-full bg-accent transition-all duration-300"
                                            style={{ width: `${(progress.loaded / progress.total) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-caption text-tertiary">
                                        {progress.loaded}/{progress.total} {t.drivers.loadingProgress}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : histError ? (
                        <ErrorState title={t.search.dataErrorTitle} message={histError} />
                    ) : (
                        <div className="space-y-5">
                            {/* Stats row */}
                            <section className="grid gap-3 sm:grid-cols-3">
                                <StatCard icon={<Users className="h-4 w-4" />} label={t.drivers.totalDrivers} value={historicalDrivers.length} />
                                <StatCard icon={<Globe className="h-4 w-4" />} label={t.drivers.nationalities} value={totalNationalities} />
                                <StatCard icon={<Trophy className="h-4 w-4" />} label={t.drivers.champions} value={totalChampionsAllTime} tone="accent" />
                            </section>

                            {/* Search + Filters */}
                            <div className="space-y-3">
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-tertiary">
                                        <Search className="h-4 w-4" strokeWidth={2} />
                                    </div>
                                    <input
                                        id="driver-search"
                                        type="text"
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        placeholder={t.drivers.searchPlaceholder}
                                        className={inputClasses}
                                    />
                                </div>

                                {/* Filter row */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <select
                                        value={nationalityFilter}
                                        onChange={(e) => setNationalityFilter(e.target.value)}
                                        className={selectClasses}
                                    >
                                        <option value="">{t.drivers.allNationalities}</option>
                                        {uniqueNationalities.map((nat) => (
                                            <option key={nat} value={nat}>{nat}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={decadeFilter}
                                        onChange={(e) => setDecadeFilter(e.target.value)}
                                        className={selectClasses}
                                    >
                                        <option value="">{t.drivers.allDecades}</option>
                                        {uniqueDecades.map((decade) => (
                                            <option key={decade} value={String(decade)}>{decade}s</option>
                                        ))}
                                    </select>

                                    <button
                                        type="button"
                                        onClick={() => setChampionsOnly((v) => !v)}
                                        aria-pressed={championsOnly}
                                        className={filterChipClasses(championsOnly)}
                                    >
                                        {t.drivers.worldChampionsOnly}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setWinnersOnly((v) => !v)}
                                        aria-pressed={winnersOnly}
                                        className={filterChipClasses(winnersOnly)}
                                    >
                                        {t.drivers.raceWinnersOnly}
                                    </button>

                                    {(query || nationalityFilter || decadeFilter || championsOnly || winnersOnly) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setQuery('');
                                                setNationalityFilter('');
                                                setDecadeFilter('');
                                                setChampionsOnly(false);
                                                setWinnersOnly(false);
                                                setPage(1);
                                            }}
                                        >
                                            {t.drivers.resetFilters}
                                        </Button>
                                    )}
                                </div>

                                {/* Sort row */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-caption font-medium uppercase tracking-wide text-tertiary">
                                        {t.drivers.sortBy}
                                    </span>
                                    {(['wins', 'points', 'seasons'] as SortField[]).map((field) => {
                                        const isActive = sortField === field;
                                        const arrow = isActive ? (sortDirection === 'desc' ? ' ↓' : ' ↑') : '';
                                        const labels: Record<SortField, string> = {
                                            wins: t.drivers.wins,
                                            points: t.drivers.points,
                                            seasons: t.drivers.seasons,
                                        };
                                        return (
                                            <button
                                                key={field}
                                                type="button"
                                                onClick={() => {
                                                    if (sortField === field) {
                                                        setSortDirection((d) => d === 'desc' ? 'asc' : 'desc');
                                                    } else {
                                                        setSortField(field);
                                                        setSortDirection('desc');
                                                    }
                                                }}
                                                className={filterChipClasses(isActive)}
                                            >
                                                {labels[field]}{arrow}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Driver grid */}
                            {filteredHistorical.length === 0 ? (
                                <Card padding="lg" className="text-center">
                                    <p className="text-footnote text-secondary">{t.drivers.emptyState}</p>
                                </Card>
                            ) : (
                                <>
                                    <motion.section {...gridMotionProps} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {paginatedHistorical.map((driver) => (
                                            <MotionCard
                                                key={driver.driverId}
                                                variants={staggerItem}
                                                padding="sm"
                                                className="relative transition-colors hover:bg-surface-raised"
                                            >
                                                {/*
                                                  An overlay button rather than a wrapper: <button> cannot
                                                  legally contain the heading below, and a div with
                                                  role="button" would re-create a native control. This keeps
                                                  the whole card as one large, keyboard-reachable target with
                                                  a screen-reader name.
                                                */}
                                                <button
                                                    type="button"
                                                    onClick={() => setSelected({ kind: 'historical', driver })}
                                                    aria-label={`${driver.givenName} ${driver.familyName} — ${t.drivers.profile}`}
                                                    className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                                />

                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex min-w-0 items-start gap-3">
                                                        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border border-border bg-surface-raised">
                                                            <span className="text-footnote font-semibold text-secondary">
                                                                {getDriverInitials(driver)}
                                                            </span>
                                                            {driver.permanentNumber && (
                                                                <span className="text-caption text-tertiary">
                                                                    #{driver.permanentNumber}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-caption font-medium uppercase tracking-wide text-tertiary">
                                                                {driver.lastTeam ?? driver.nationality}
                                                            </p>
                                                            <h2 className="mt-0.5 break-words text-title3 text-foreground">
                                                                {driver.givenName} {driver.familyName}
                                                            </h2>
                                                            <p className="mt-0.5 truncate text-footnote text-secondary">{driver.nationality}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-1.5">
                                                    <Badge tone="success">{t.drivers.wins} {driver.totalWins}</Badge>
                                                    <Badge tone="accent">{t.drivers.titles} {driver.championships}</Badge>
                                                    <Badge>{t.drivers.seasons} {driver.seasonsActive}</Badge>
                                                    <Badge>{t.drivers.firstEntry} {driver.firstSeason || '—'}</Badge>
                                                    <Badge>{t.drivers.points} {driver.totalPoints}</Badge>
                                                </div>

                                                {driver.teamsHistory.length > 0 && (
                                                    <p className="mt-3 text-caption text-tertiary">
                                                        {t.drivers.teamHistory}{' '}
                                                        <span className="font-semibold text-secondary">
                                                            {driver.teamsHistory.length}
                                                        </span>
                                                    </p>
                                                )}
                                            </MotionCard>
                                        ))}
                                    </motion.section>

                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={(p) => {
                                            setPage(p);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </PageShell>

        {selected && (
            <DriverDetailCard
                detail={
                    selected.kind === 'current'
                        ? currentDriverDetail(selected.driver, detailLabels, language)
                        : historicalDriverDetail(selected.driver, detailLabels, language)
                }
                teamLogos={teamRecords}
                labels={{
                    eyebrow: t.drivers.profile,
                    teamHistory: t.drivers.teamHistory,
                    close: t.common.close
                }}
                onClose={() => setSelected(null)}
            />
        )}
        </>
    );
};

export default Drivers;
