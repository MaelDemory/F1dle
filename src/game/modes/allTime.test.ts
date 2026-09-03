import { HistoricalDriver } from '../../types';
import { buildTiles } from '../board';
import { allTimeMode } from './allTime';

const historical = (overrides: Partial<HistoricalDriver>): HistoricalDriver => ({
    driverId: 'alonso',
    givenName: 'Fernando',
    familyName: 'Alonso',
    nationality: 'Spanish',
    totalWins: 32,
    totalPoints: 2396,
    championships: 2,
    seasonsActive: 21,
    firstSeason: 2001,
    lastSeason: 2026,
    lastTeam: 'Aston Martin',
    teamsHistory: ['Minardi', 'Renault', 'McLaren', 'Ferrari', 'Alpine', 'Aston Martin'],
    ...overrides
});

describe('allTimeMode', () => {
    it('swaps entries for seasons, since historical_drivers has no race counter', () => {
        const keys = allTimeMode.columns.map((column) => column.key);
        expect(keys).toEqual(['driver', 'teams', 'nationality', 'points', 'seasons', 'wins', 'titles']);
        expect(keys).not.toContain('entries');
    });

    it('marks the team column correct on a single shared outfit', () => {
        const answer = historical({});
        const guess = historical({
            driverId: 'raikkonen',
            givenName: 'Kimi',
            familyName: 'Raikkonen',
            teamsHistory: ['Sauber', 'McLaren', 'Ferrari', 'Lotus', 'Alfa Romeo']
        });

        const teams = buildTiles(guess, answer, allTimeMode.columns).find((tile) => tile.key === 'teams');
        expect(teams?.tone).toBe('correct');
    });

    it('marks the team column a miss when the careers never overlap', () => {
        const answer = historical({ teamsHistory: ['Ferrari'] });
        const guess = historical({ driverId: 'x', teamsHistory: ['Williams', 'Brabham'] });

        const teams = buildTiles(guess, answer, allTimeMode.columns).find((tile) => tile.key === 'teams');
        expect(teams?.tone).toBe('miss');
    });

    it('truncates a long team history and counts the remainder', () => {
        const teamsColumn = allTimeMode.columns.find((column) => column.key === 'teams')!;
        expect(teamsColumn.display(historical({}))).toBe('Minardi, Renault +4');
        expect(teamsColumn.display(historical({ teamsHistory: ['Ferrari', 'McLaren'] }))).toBe('Ferrari, McLaren');
        expect(teamsColumn.display(historical({ teamsHistory: ['Ferrari'] }))).toBe('Ferrari');
    });

    it('shows an em dash for a driver with no recorded team', () => {
        const teamsColumn = allTimeMode.columns.find((column) => column.key === 'teams')!;
        expect(teamsColumn.display(historical({ teamsHistory: [] }))).toBe('—');
    });

    it('handles the one-race 1950s entrants that the unfiltered pool contains', () => {
        const answer = historical({
            driverId: 'whitehouse',
            givenName: 'Bill',
            familyName: 'Whitehouse',
            totalWins: 0,
            totalPoints: 0,
            championships: 0,
            seasonsActive: 1,
            teamsHistory: ['Connaught']
        });

        const tiles = buildTiles(answer, answer, allTimeMode.columns);
        expect(tiles.slice(1).every((tile) => tile.tone === 'correct')).toBe(true);
        expect(allTimeMode.getFullName(answer)).toBe('Bill Whitehouse');
    });

    it('identifies drivers by driverId, not by a numeric id', () => {
        expect(allTimeMode.getId(historical({}))).toBe('alonso');
    });
});
