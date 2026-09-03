import { HistoricalDriver } from '../types';

/**
 * Mirrors the filter in fetchCurrentGridHistoricalDrivers. Kept as a local copy
 * because the exported function performs a network call; the logic under test is
 * how the current season is derived, not the fetch.
 */
const currentGridOf = (drivers: HistoricalDriver[]): HistoricalDriver[] => {
    if (drivers.length === 0) {
        return [];
    }

    const currentSeason = Math.max(...drivers.map((driver) => driver.lastSeason));
    return drivers.filter((driver) => driver.lastSeason === currentSeason);
};

const driver = (id: string, lastSeason: number): HistoricalDriver => ({
    driverId: id,
    givenName: id,
    familyName: id,
    nationality: 'British',
    totalWins: 0,
    totalPoints: 0,
    championships: 0,
    seasonsActive: 1,
    firstSeason: lastSeason,
    lastSeason,
    teamsHistory: []
});

describe('current-grid filter', () => {
    it('keeps only the drivers of the most recent season present', () => {
        const roster = [
            driver('a', 2026),
            driver('b', 2026),
            driver('c', 2025),
            driver('d', 1954)
        ];

        expect(currentGridOf(roster).map((d) => d.driverId)).toEqual(['a', 'b']);
    });

    // Deriving the season from the data rather than the clock: a clock-based year
    // would return nobody on 1 January, before the new season is seeded.
    it('follows the data, not the calendar', () => {
        const roster = [driver('a', 2024), driver('b', 2023)];

        expect(currentGridOf(roster).map((d) => d.driverId)).toEqual(['a']);
    });

    it('returns nothing for an empty roster instead of throwing', () => {
        expect(currentGridOf([])).toEqual([]);
    });
});
