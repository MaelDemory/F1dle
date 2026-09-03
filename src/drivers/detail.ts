import { Driver, HistoricalDriver } from '../types';

export type DetailStat = { key: string; label: string; value: string };

/**
 * One driver's record, normalised so a single card can present either data
 * shape. The two sources genuinely differ — the current grid carries poles,
 * podiums and fastest laps but a single team, while the historical roster
 * carries a full team history but none of those per-race counters — so absent
 * sections are omitted rather than rendered empty.
 */
export type DriverDetail = {
    fullName: string;
    nationality: string;
    team: string | null;
    /** Race number, or the historical permanent number. */
    number: string | null;
    /** Three-letter code, historical records only. */
    code: string | null;
    logo: { src: string; mime: string } | null;
    /** The headline figures, shown as stat tiles. */
    headline: DetailStat[];
    /** Everything else, shown as label/value rows. */
    facts: DetailStat[];
    teamsHistory: string[];
};

export type DetailLabels = {
    wins: string;
    titles: string;
    podiums: string;
    poles: string;
    points: string;
    entries: string;
    fastestLaps: string;
    seasons: string;
    firstEntry: string;
    lastSeason: string;
    lastTeam: string;
    birthDate: string;
    nationality: string;
    code: string;
    careerSpan: string;
};

/**
 * Parameters
 *   value — a date string from the API, or null/undefined.
 *   locale — BCP 47 tag used for formatting.
 * What it does
 *   Formats a birth date for display, falling back to the raw string if it does
 *   not parse. The API has returned nulls for older records, so absence is
 *   expected rather than exceptional.
 * Output
 *   A localised date, or null when there is nothing to show.
 */
const formatDate = (value: string | null | undefined, locale: string): string | null => {
    if (!value) {
        return null;
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
};

const stat = (key: string, label: string, value: string | number): DetailStat => ({
    key,
    label,
    value: `${value}`
});

/**
 * Parameters
 *   driver — a current-grid record. labels — translated field names.
 *   locale — for date formatting.
 * What it does
 *   Adapts a current-grid driver to the shared detail shape. Wins, podiums,
 *   poles and titles lead because they are the figures the grid itself sorts and
 *   filters on; the rest follow as facts.
 * Output
 *   A DriverDetail with no team history — that table holds a single team.
 */
export const currentDriverDetail = (
    driver: Driver,
    labels: DetailLabels,
    locale: string
): DriverDetail => {
    const birth = formatDate(driver.birth_date, locale);

    return {
        fullName: `${driver.surname} ${driver.name}`,
        nationality: driver.nationality,
        team: driver.team,
        number: driver.driver_number ? `${driver.driver_number}` : null,
        code: null,
        logo:
            driver.team_logo_base64 && driver.team_logo_mime_type
                ? { src: driver.team_logo_base64, mime: driver.team_logo_mime_type }
                : null,
        headline: [
            stat('wins', labels.wins, driver.win),
            stat('podiums', labels.podiums, driver.podium),
            stat('poles', labels.poles, driver.pole),
            stat('titles', labels.titles, driver.world_championship)
        ],
        facts: [
            stat('points', labels.points, driver.career_points),
            stat('entries', labels.entries, driver.entries),
            stat('fastestLaps', labels.fastestLaps, driver.fastest_laps),
            stat('firstEntry', labels.firstEntry, driver.first_entry || '—'),
            ...(birth ? [stat('birthDate', labels.birthDate, birth)] : [])
        ],
        teamsHistory: []
    };
};

/**
 * Parameters
 *   driver — a historical record. labels — translated field names.
 *   locale — for date formatting.
 * What it does
 *   Adapts a historical driver to the shared detail shape. Seasons active stands
 *   in for entries, which this table does not record, and the career span is
 *   presented as one fact rather than two loose years.
 * Output
 *   A DriverDetail carrying the full team history.
 */
export const historicalDriverDetail = (
    driver: HistoricalDriver,
    labels: DetailLabels,
    locale: string
): DriverDetail => {
    const birth = formatDate(driver.dateOfBirth, locale);
    const span = driver.firstSeason && driver.lastSeason
        ? `${driver.firstSeason} – ${driver.lastSeason}`
        : null;

    return {
        fullName: `${driver.givenName} ${driver.familyName}`,
        nationality: driver.nationality,
        team: driver.lastTeam ?? null,
        number: driver.permanentNumber ?? null,
        code: driver.code ?? null,
        logo: null,
        headline: [
            stat('wins', labels.wins, driver.totalWins),
            stat('titles', labels.titles, driver.championships),
            stat('points', labels.points, driver.totalPoints),
            stat('seasons', labels.seasons, driver.seasonsActive)
        ],
        facts: [
            ...(span ? [stat('careerSpan', labels.careerSpan, span)] : []),
            ...(driver.lastTeam ? [stat('lastTeam', labels.lastTeam, driver.lastTeam)] : []),
            ...(birth ? [stat('birthDate', labels.birthDate, birth)] : []),
            ...(driver.code ? [stat('code', labels.code, driver.code)] : [])
        ],
        teamsHistory: driver.teamsHistory
    };
};
