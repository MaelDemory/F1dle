import { Driver } from '../../types';
import { buildTiles } from '../board';
import { GuessTile } from '../board';
import { currentGridMode } from './currentGrid';

const driver = (overrides: Partial<Driver>): Driver => ({
    id_driver: 1,
    name: 'Hamilton',
    surname: 'Lewis',
    birth_date: '1985-01-07',
    nationality: 'British',
    team: 'Ferrari',
    win: 106,
    pole: 104,
    first_entry: 2007,
    driver_number: 44,
    podium: 202,
    fastest_laps: 67,
    career_points: 5201.5,
    entries: 392,
    world_championship: 7,
    ...overrides
});

/**
 * Reproduces how the pre-refactor board printed a cell: the arrow was baked into
 * the cell's text. It now lives on the tile and is appended by GuessCell, so this
 * helper is what proves the rendered result is unchanged.
 */
const renderedLabel = (tile: GuessTile): string => {
    const arrow = tile.direction === 'up' ? '↑' : tile.direction === 'down' ? '↓' : '';
    return `${tile.content} ${arrow}`.trim();
};

describe('currentGridMode', () => {
    it('declares the seven pre-refactor columns, in order', () => {
        expect(currentGridMode.columns.map((column) => column.key)).toEqual([
            'driver',
            'team',
            'nationality',
            'points',
            'entries',
            'wins',
            'titles'
        ]);
    });

    it('leaves the driver-name column neutral and uncompared', () => {
        const nameColumn = currentGridMode.columns[0];
        expect(nameColumn.compare).toBeUndefined();
        expect(nameColumn.display(driver({}))).toBe('Lewis Hamilton');
    });

    it('produces the same tones, directions and labels as before the refactor', () => {
        const answer = driver({ id_driver: 1 });
        const guess = driver({
            id_driver: 2,
            name: 'Leclerc',
            surname: 'Charles',
            nationality: 'Monegasque',
            team: 'Ferrari',
            career_points: 1827,
            entries: 200,
            win: 9,
            world_championship: 0
        });

        const tiles = buildTiles(guess, answer, currentGridMode.columns);

        expect(tiles.map((tile) => [tile.key, tile.tone, renderedLabel(tile)])).toEqual([
            ['driver', 'neutral', 'Charles Leclerc'],
            ['team', 'correct', 'Ferrari'],
            ['nationality', 'miss', 'Monegasque'],
            ['points', 'miss', '1827 ↑'],
            ['entries', 'miss', '200 ↑'],
            ['wins', 'miss', '9 ↑'],
            ['titles', 'miss', '0 ↑']
        ]);
    });

    it('marks every comparable column correct when guessing the answer itself', () => {
        const answer = driver({});
        const tiles = buildTiles(answer, answer, currentGridMode.columns);

        expect(tiles[0].tone).toBe('neutral');
        expect(tiles.slice(1).every((tile) => tile.tone === 'correct')).toBe(true);
        expect(tiles.some((tile) => tile.direction !== undefined)).toBe(false);
    });

    it('points down when the guess overshoots', () => {
        const answer = driver({ career_points: 100, entries: 10, win: 1, world_championship: 0 });
        const guess = driver({ id_driver: 2, career_points: 500, entries: 50, win: 20, world_championship: 3 });

        const byKey = Object.fromEntries(
            buildTiles(guess, answer, currentGridMode.columns).map((tile) => [tile.key, tile.direction])
        );

        expect(byKey).toMatchObject({ points: 'down', entries: 'down', wins: 'down', titles: 'down' });
    });

    it('searches on given name, family name and full name — and nothing else', () => {
        expect(currentGridMode.getSearchTerms(driver({}))).toEqual(['Lewis', 'Hamilton', 'Lewis Hamilton']);
    });
});
