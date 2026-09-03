import { act, renderHook, waitFor } from '@testing-library/react';
import { useGuessRoundFromPool } from './useGuessRoundFromPool';

type Entry = { id: number };

const pool: Entry[] = Array.from({ length: 5 }, (_, index) => ({ id: index + 1 }));

describe('useGuessRoundFromPool', () => {
    it('draws the answer from the pool it loaded', async () => {
        const { result } = renderHook(() => useGuessRoundFromPool(() => Promise.resolve(pool)));

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.pool).toEqual(pool);
        // The property that matters: an answer outside the pool could never be
        // guessed, since winning compares ids against the pool.
        expect(pool).toContain(result.current.answer);
        expect(result.current.error).toBe('');
    });

    it('reports an empty pool rather than handing back a null answer silently', async () => {
        const { result } = renderHook(() => useGuessRoundFromPool(() => Promise.resolve([])));

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.answer).toBeNull();
        expect(result.current.error).toBe('empty-pool');
    });

    it('surfaces a fetch failure and leaves the pool empty', async () => {
        const { result } = renderHook(() =>
            useGuessRoundFromPool(() => Promise.reject(new Error('network down')))
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.pool).toEqual([]);
        expect(result.current.answer).toBeNull();
        expect(result.current.error).toBe('network down');
    });

    it('can draw any member of the pool across rounds', async () => {
        const drawn = new Set<number>();

        for (let i = 0; i < 40; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            const { result, unmount } = renderHook(() =>
                useGuessRoundFromPool(() => Promise.resolve(pool))
            );
            // eslint-disable-next-line no-await-in-loop
            await waitFor(() => expect(result.current.isLoading).toBe(false));
            drawn.add(result.current.answer!.id);
            act(() => unmount());
        }

        expect(drawn.size).toBeGreaterThan(1);
    });
});
