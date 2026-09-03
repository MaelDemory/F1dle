/**
 * Animation and pacing constants for the guessing board.
 *
 * These values are behavioural source of truth: the victory modal is timed to
 * appear exactly when the last tile of the winning row finishes settling. Change
 * one and the reveal desynchronises from the animation.
 */

export const MAX_ATTEMPTS = 6;

/** Duration of a single tile's entrance animation (the `spring` token). */
export const TILE_FLIP_DURATION_MS = 350;

/** Delay added per tile so a row reveals left to right. */
export const TILE_FLIP_STAGGER_MS = 90;

/**
 * Parameters
 *   columnCount — number of tiles in a guess row.
 * What it does
 *   Computes how long a full row takes to finish animating: the last tile starts
 *   after (columnCount - 1) staggers and then runs for one full duration.
 * Output
 *   Delay in milliseconds before the victory modal should be revealed.
 *   For the 7-column boards this is 350 + 6 * 90 = 890 ms.
 */
export const victoryRevealDelayMs = (columnCount: number): number =>
    TILE_FLIP_DURATION_MS + Math.max(0, columnCount - 1) * TILE_FLIP_STAGGER_MS;

/**
 * Victory delay for boards that reveal guesses as a plain list rather than a row
 * of tiles — the teams board. It has no per-column animation to wait on, so the
 * value is independent of victoryRevealDelayMs and is simply the pre-existing
 * behaviour of that page.
 */
export const LIST_VICTORY_REVEAL_DELAY_MS = 800;
