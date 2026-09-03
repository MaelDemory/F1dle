import { compareNumber, compareSet, compareText } from './comparators';

describe('compareText', () => {
    it('marks identical values correct, without a direction', () => {
        expect(compareText('Ferrari', 'Ferrari')).toEqual({ tone: 'correct' });
    });

    it('marks different values as a miss', () => {
        expect(compareText('Ferrari', 'McLaren')).toEqual({ tone: 'miss' });
    });

    it('does not treat differing case as equal', () => {
        expect(compareText('ferrari', 'Ferrari').tone).toBe('miss');
    });
});

describe('compareNumber', () => {
    it('marks equal numbers correct', () => {
        expect(compareNumber(7, 7)).toEqual({ tone: 'correct' });
    });

    it('points up when the answer is higher', () => {
        expect(compareNumber(3, 9)).toEqual({ tone: 'miss', direction: 'up' });
    });

    it('points down when the answer is lower', () => {
        expect(compareNumber(9, 3)).toEqual({ tone: 'miss', direction: 'down' });
    });

    it('handles fractional points, which the API returns for half-point seasons', () => {
        expect(compareNumber(1342.5, 2396)).toEqual({ tone: 'miss', direction: 'up' });
        expect(compareNumber(1342.5, 1342.5)).toEqual({ tone: 'correct' });
    });
});

describe('compareSet', () => {
    it('marks a shared entry correct even when the rest differ', () => {
        expect(compareSet(['Renault', 'Ferrari'], ['Ferrari', 'Mercedes'])).toEqual({ tone: 'correct' });
    });

    it('marks disjoint collections as a miss', () => {
        expect(compareSet(['Williams'], ['Ferrari', 'Mercedes'])).toEqual({ tone: 'miss' });
    });

    it('matches on several shared entries', () => {
        expect(compareSet(['Ferrari', 'Mercedes'], ['Mercedes', 'Ferrari'])).toEqual({ tone: 'correct' });
    });

    it('does not count two empty collections as a match', () => {
        expect(compareSet([], [])).toEqual({ tone: 'miss' });
    });

    it('misses when either side is empty', () => {
        expect(compareSet(['Ferrari'], [])).toEqual({ tone: 'miss' });
        expect(compareSet([], ['Ferrari'])).toEqual({ tone: 'miss' });
    });
});
