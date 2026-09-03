import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { MAX_ATTEMPTS } from './timings';
import { useGuessGame } from './useGuessGame';

type Entry = { id: number; label: string };

const pool: Entry[] = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    label: `Driver ${index + 1}`
}));

const answer = pool[3];

const setup = () =>
    renderHook(() =>
        useGuessGame<Entry>({
            answer,
            pool,
            getId: (entry) => entry.id,
            getFullName: (entry) => entry.label
        })
    );

describe('useGuessGame', () => {
    it('starts with an empty, undecided round', () => {
        const { result } = setup();

        expect(result.current.guesses).toEqual([]);
        expect(result.current.hasWon).toBe(false);
        expect(result.current.hasLost).toBe(false);
        expect(result.current.isComplete).toBe(false);
        expect(result.current.notice).toBeNull();
    });

    it('accepts a guess and reports it accepted', () => {
        const { result } = setup();

        let accepted = false;
        act(() => {
            accepted = result.current.submitGuess(pool[0]);
        });

        expect(accepted).toBe(true);
        expect(result.current.guesses).toHaveLength(1);
        expect(result.current.latestGuessId).toBe(pool[0].id);
    });

    it('rejects a duplicate without spending an attempt', () => {
        const { result } = setup();

        act(() => {
            result.current.submitGuess(pool[0]);
        });

        let accepted = true;
        act(() => {
            accepted = result.current.submitGuess(pool[0]);
        });

        expect(accepted).toBe(false);
        expect(result.current.guesses).toHaveLength(1);
        expect(result.current.notice).toBe('duplicate');
    });

    it('wins as soon as the answer is guessed', () => {
        const { result } = setup();

        act(() => {
            result.current.submitGuess(pool[0]);
        });
        act(() => {
            result.current.submitGuess(answer);
        });

        expect(result.current.hasWon).toBe(true);
        expect(result.current.hasLost).toBe(false);
        expect(result.current.isComplete).toBe(true);
    });

    it('loses on the sixth wrong guess, not the fifth', () => {
        const { result } = setup();
        const wrong = pool.filter((entry) => entry.id !== answer.id);

        for (let i = 0; i < MAX_ATTEMPTS - 1; i += 1) {
            // eslint-disable-next-line no-loop-func
            act(() => {
                result.current.submitGuess(wrong[i]);
            });
        }

        expect(result.current.hasLost).toBe(false);

        act(() => {
            result.current.submitGuess(wrong[MAX_ATTEMPTS - 1]);
        });

        expect(result.current.hasLost).toBe(true);
        expect(result.current.isComplete).toBe(true);
    });

    it('ignores further guesses once the round is over', () => {
        const { result } = setup();

        act(() => {
            result.current.submitGuess(answer);
        });

        let accepted = true;
        act(() => {
            accepted = result.current.submitGuess(pool[0]);
        });

        expect(accepted).toBe(false);
        expect(result.current.guesses).toHaveLength(1);
    });

    it('resolves a free-typed name, case-insensitively and trimmed', () => {
        const { result } = setup();

        let accepted = false;
        act(() => {
            accepted = result.current.submitByName('  driver 4  ');
        });

        expect(accepted).toBe(true);
        expect(result.current.hasWon).toBe(true);
    });

    it('flags an unknown name as invalid without spending an attempt', () => {
        const { result } = setup();

        let accepted = true;
        act(() => {
            accepted = result.current.submitByName('Nobody');
        });

        expect(accepted).toBe(false);
        expect(result.current.guesses).toEqual([]);
        expect(result.current.notice).toBe('invalid');
    });

    it('clears the notice on demand', () => {
        const { result } = setup();

        act(() => {
            result.current.submitByName('Nobody');
        });
        act(() => {
            result.current.clearNotice();
        });

        expect(result.current.notice).toBeNull();
    });
});
