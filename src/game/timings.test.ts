import {
    LIST_VICTORY_REVEAL_DELAY_MS,
    MAX_ATTEMPTS,
    TILE_FLIP_DURATION_MS,
    TILE_FLIP_STAGGER_MS,
    victoryRevealDelayMs
} from './timings';

describe('timings', () => {
    // Regression guard. These values were the pre-refactor behaviour of
    // SearchBar.tsx; the victory modal is timed against the tile animation, so a
    // silent change here desynchronises the reveal.
    it('keeps the pre-refactor constants', () => {
        expect(MAX_ATTEMPTS).toBe(6);
        expect(TILE_FLIP_DURATION_MS).toBe(350);
        expect(TILE_FLIP_STAGGER_MS).toBe(90);
    });

    it('reveals a 7-column board after 890ms, exactly as before the refactor', () => {
        expect(victoryRevealDelayMs(7)).toBe(890);
    });

    it('scales with the column count', () => {
        expect(victoryRevealDelayMs(1)).toBe(350);
        expect(victoryRevealDelayMs(8)).toBe(980);
    });

    it('never returns less than one tile duration', () => {
        expect(victoryRevealDelayMs(0)).toBe(350);
    });

    // The teams board reveals guesses as a list, so its delay is independent of
    // the tile animation. 800ms is its pre-migration behaviour.
    it('keeps the list board at its own 800ms reveal', () => {
        expect(LIST_VICTORY_REVEAL_DELAY_MS).toBe(800);
        expect(LIST_VICTORY_REVEAL_DELAY_MS).not.toBe(victoryRevealDelayMs(7));
    });
});
