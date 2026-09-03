import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { THEME_STORAGE_KEY } from './theme';
import { ThemeProvider, useTheme } from './ThemeContext';

const Probe = () => {
    const { theme, resolved, setTheme } = useTheme();

    return (
        <div>
            <span data-testid="theme">{theme}</span>
            <span data-testid="resolved">{resolved}</span>
            <button onClick={() => setTheme('dark')}>dark</button>
            <button onClick={() => setTheme('light')}>light</button>
            <button onClick={() => setTheme('system')}>system</button>
            {/* Supplying an origin is what opts into the circular reveal. */}
            <button onClick={() => setTheme('dark', { x: 10, y: 10 })}>dark-animated</button>
        </div>
    );
};

const renderProbe = () => render(<ThemeProvider><Probe /></ThemeProvider>);

const classes = () => Array.from(document.documentElement.classList);

/** jsdom has no matchMedia; the provider must cope, and tests need to steer it. */
const stubMatchMedia = (matches: boolean) => {
    (window as any).matchMedia = (query: string) => ({
        matches,
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined
    });
};

beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
    stubMatchMedia(false);
});

describe('ThemeProvider', () => {
    it('defaults to system, which sets no class on <html>', () => {
        renderProbe();

        expect(screen.getByTestId('theme')).toHaveTextContent('system');
        expect(classes()).not.toContain('light');
        expect(classes()).not.toContain('dark');
    });

    it('forces dark by adding the class, and persists the choice', () => {
        renderProbe();

        act(() => {
            screen.getByText('dark').click();
        });

        expect(classes()).toContain('dark');
        expect(classes()).not.toContain('light');
        expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    });

    it('removes the previous class when switching, never stacking both', () => {
        renderProbe();

        act(() => {
            screen.getByText('dark').click();
        });
        act(() => {
            screen.getByText('light').click();
        });

        expect(classes()).toContain('light');
        expect(classes()).not.toContain('dark');
    });

    it('drops back to no class on system, so the stylesheet defers to the OS', () => {
        renderProbe();

        act(() => {
            screen.getByText('dark').click();
        });
        act(() => {
            screen.getByText('system').click();
        });

        expect(classes()).not.toContain('dark');
        expect(classes()).not.toContain('light');
        expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
    });

    it('restores a stored choice on mount', () => {
        window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
        renderProbe();

        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        expect(classes()).toContain('dark');
    });

    it('falls back to system when storage holds junk', () => {
        window.localStorage.setItem(THEME_STORAGE_KEY, 'midnight');
        renderProbe();

        expect(screen.getByTestId('theme')).toHaveTextContent('system');
    });

    it('resolves system against the OS preference', () => {
        stubMatchMedia(true);
        renderProbe();

        expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
    });

    it('keeps a forced theme even when the OS disagrees', () => {
        stubMatchMedia(true);
        renderProbe();

        act(() => {
            screen.getByText('light').click();
        });

        expect(screen.getByTestId('resolved')).toHaveTextContent('light');
    });

    it('updates the browser chrome colour to match the resolved theme', () => {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        meta.setAttribute('content', '#ffffff');
        document.head.appendChild(meta);

        renderProbe();
        expect(meta.getAttribute('content')).toBe('#f7f7f8');

        act(() => {
            screen.getByText('dark').click();
        });
        expect(meta.getAttribute('content')).toBe('#0e0e10');

        meta.remove();
    });

    // The animated path writes the class itself, inside the transition callback,
    // because startViewTransition snapshots the document around that callback.
    // jsdom has no such API, so it is stubbed to run its callback synchronously.
    it('still applies the theme when the circular reveal runs', () => {
        const calls: string[] = [];
        (document as any).startViewTransition = (callback: () => void) => {
            calls.push('transition');
            callback();
            return {};
        };
        (Element.prototype as any).animate = () => undefined;

        renderProbe();

        act(() => {
            screen.getByText('dark-animated').click();
        });

        expect(calls).toEqual(['transition']);
        expect(classes()).toContain('dark');
        expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

        delete (document as any).startViewTransition;
    });

    it('leaves no theme-switching class behind once the round trip is done', () => {
        (document as any).startViewTransition = (callback: () => void) => {
            callback();
            return { finished: Promise.resolve() };
        };
        (Element.prototype as any).animate = () => undefined;

        renderProbe();

        act(() => {
            screen.getByText('dark-animated').click();
        });

        return Promise.resolve().then(() => {
            expect(classes()).not.toContain('theme-switching');
            delete (document as any).startViewTransition;
        });
    });

    it('skips the reveal when no origin is given, and changes instantly', () => {
        const calls: string[] = [];
        (document as any).startViewTransition = (callback: () => void) => {
            calls.push('transition');
            callback();
            return {};
        };

        renderProbe();

        act(() => {
            screen.getByText('dark').click();
        });

        expect(calls).toEqual([]);
        expect(classes()).toContain('dark');

        delete (document as any).startViewTransition;
    });
});
