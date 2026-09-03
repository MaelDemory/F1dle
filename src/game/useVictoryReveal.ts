import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Parameters
 *   hasWon — whether the round is won. delayMs — how long to wait before the
 *   reveal, which each board decides for itself. guessCount — included so the
 *   timer is re-evaluated if the round state shifts underneath it.
 * What it does
 *   Delays the victory modal until the winning row has finished revealing, and
 *   tears the timer down on unmount or when the round resets — the leak this
 *   guards against is a modal appearing over the next round.
 * Output
 *   `isVisible` for the modal, and `hide` to dismiss it (which also cancels a
 *   pending reveal).
 */
export const useVictoryReveal = (hasWon: boolean, delayMs: number, guessCount: number) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearPending = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!hasWon) {
            clearPending();
            setIsVisible(false);
            return;
        }

        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            timeoutRef.current = null;
        }, delayMs);

        return clearPending;
    }, [hasWon, delayMs, guessCount, clearPending]);

    const hide = useCallback(() => {
        clearPending();
        setIsVisible(false);
    }, [clearPending]);

    return { isVisible, hide };
};
