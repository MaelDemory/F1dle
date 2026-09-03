import { Driver, HistoricalDriver } from '../types';
import { currentDriverDetail, DetailLabels, historicalDriverDetail } from './detail';

const labels: DetailLabels = {
    wins: 'Wins', titles: 'Titles', podiums: 'Podiums', poles: 'Poles', points: 'Points',
    entries: 'Entries', fastestLaps: 'Fastest laps', seasons: 'Seasons',
    firstEntry: 'First entry', lastSeason: 'Last season', lastTeam: 'Last team',
    birthDate: 'Born', nationality: 'Nationality', code: 'Code', careerSpan: 'Career'
};

const driver = (overrides: Partial<Driver> = {}): Driver => ({
    id_driver: 1,
    name: 'Hamilton',
    surname: 'Lewis',
    birth_date: '1985-01-07',
    nationality: 'British',
    team: 'Ferrari',
    win: 106,
    pole: 104,
    podium: 202,
    first_entry: 2007,
    driver_number: 44,
    fastest_laps: 67,
    career_points: 5201.5,
    entries: 392,
    world_championship: 7,
    ...overrides
});

const historical = (overrides: Partial<HistoricalDriver> = {}): HistoricalDriver => ({
    driverId: 'fangio',
    givenName: 'Juan Manuel',
    familyName: 'Fangio',
    nationality: 'Argentine',
    totalWins: 24,
    totalPoints: 245,
    championships: 5,
    seasonsActive: 8,
    firstSeason: 1950,
    lastSeason: 1958,
    lastTeam: 'Maserati',
    teamsHistory: ['Alfa Romeo', 'Maserati', 'Mercedes', 'Ferrari'],
    ...overrides
});

const values = (stats: { key: string; value: string }[]) =>
    Object.fromEntries(stats.map((s) => [s.key, s.value]));

describe('currentDriverDetail', () => {
    it('names the driver given-name first, as the grid displays it', () => {
        expect(currentDriverDetail(driver(), labels, 'en').fullName).toBe('Lewis Hamilton');
    });

    it('leads with the figures the grid itself sorts on', () => {
        const detail = currentDriverDetail(driver(), labels, 'en');
        expect(detail.headline.map((s) => s.key)).toEqual(['wins', 'podiums', 'poles', 'titles']);
        expect(values(detail.headline)).toEqual({ wins: '106', podiums: '202', poles: '104', titles: '7' });
    });

    it('surfaces the two fields the type previously hid', () => {
        const facts = values(currentDriverDetail(driver(), labels, 'en').facts);
        expect(facts.fastestLaps).toBe('67');
        expect(currentDriverDetail(driver(), labels, 'en').headline.find((s) => s.key === 'podiums')?.value).toBe('202');
    });

    it('carries no team history — the current-grid record holds a single team', () => {
        expect(currentDriverDetail(driver(), labels, 'en').teamsHistory).toEqual([]);
    });

    it('exposes the team logo only when both halves are present', () => {
        expect(currentDriverDetail(driver(), labels, 'en').logo).toBeNull();
        expect(
            currentDriverDetail(
                driver({ team_logo_base64: 'AAA', team_logo_mime_type: 'image/png' }),
                labels,
                'en'
            ).logo
        ).toEqual({ src: 'AAA', mime: 'image/png' });
    });

    it('omits the birth date rather than showing an empty row', () => {
        const facts = currentDriverDetail(driver({ birth_date: '' }), labels, 'en').facts;
        expect(facts.some((s) => s.key === 'birthDate')).toBe(false);
    });
});

describe('historicalDriverDetail', () => {
    it('substitutes seasons for entries, which the historical record lacks', () => {
        const detail = historicalDriverDetail(historical(), labels, 'en');
        expect(detail.headline.map((s) => s.key)).toEqual(['wins', 'titles', 'points', 'seasons']);
        expect(detail.headline.some((s) => s.key === 'entries')).toBe(false);
    });

    it('presents the career as one span rather than two loose years', () => {
        const facts = values(historicalDriverDetail(historical(), labels, 'en').facts);
        expect(facts.careerSpan).toBe('1950 – 1958');
    });

    it('carries the full team history', () => {
        expect(historicalDriverDetail(historical(), labels, 'en').teamsHistory).toHaveLength(4);
    });

    it('omits every optional fact that is absent', () => {
        const detail = historicalDriverDetail(
            historical({ lastTeam: undefined, dateOfBirth: undefined, code: undefined, firstSeason: 0, lastSeason: 0 }),
            labels,
            'en'
        );
        expect(detail.facts).toEqual([]);
        expect(detail.team).toBeNull();
        expect(detail.code).toBeNull();
    });

    it('formats the birth date for the active language', () => {
        const en = values(historicalDriverDetail(historical({ dateOfBirth: '1911-06-24' }), labels, 'en').facts);
        const fr = values(historicalDriverDetail(historical({ dateOfBirth: '1911-06-24' }), labels, 'fr').facts);
        expect(en.birthDate).toContain('1911');
        expect(fr.birthDate).toContain('1911');
        expect(en.birthDate).not.toBe(fr.birthDate);
    });

    it('falls back to the raw value when the date does not parse', () => {
        const facts = values(historicalDriverDetail(historical({ dateOfBirth: 'unknown' }), labels, 'en').facts);
        expect(facts.birthDate).toBe('unknown');
    });
});
