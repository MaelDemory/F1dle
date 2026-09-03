import { HistoricalDriver } from '../../types';
import { byTeamsIdentity } from './byTeams';

const driver = (overrides: Partial<HistoricalDriver> = {}): HistoricalDriver => ({
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
    teamsHistory: ['Renault', 'Ferrari'],
    ...overrides
});

describe('byTeamsIdentity', () => {
    const identity = byTeamsIdentity('wins');

    it('identifies drivers by driverId', () => {
        expect(identity.getId(driver())).toBe('alonso');
    });

    it('names a driver given-name first', () => {
        expect(identity.getFullName(driver())).toBe('Fernando Alonso');
    });

    it('keeps the pre-migration search terms: family, given, then full name', () => {
        expect(identity.getSearchTerms(driver())).toEqual(['Alonso', 'Fernando', 'Fernando Alonso']);
    });

    it('builds the subtitle with the translated wins label', () => {
        expect(identity.getSuggestionSubtitle(driver())).toBe('Spanish · 32 wins');
        expect(byTeamsIdentity('victoires').getSuggestionSubtitle(driver())).toBe('Spanish · 32 victoires');
    });

    it('carries no columns — this board judges a guess right or wrong, not per field', () => {
        expect('columns' in identity).toBe(false);
    });

    it('omits the badge for a driver with no last team', () => {
        expect(identity.renderSuggestionBadge?.(driver({ lastTeam: undefined }))).toBeNull();
    });
});
