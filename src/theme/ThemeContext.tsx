import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import {
    effectiveTheme,
    isTheme,
    Theme,
    THEME_COLORS,
    THEME_STORAGE_KEY,
    themeClass
} from './theme';
import { canRevealTheme, revealTheme, TransitionOrigin } from './viewTransition';

const DARK_QUERY = '(prefers-color-scheme: dark)';

type ThemeContextValue = {
    theme: Theme;
    /**
     * `origin` opts into the circular reveal, spreading from that point. Omit it
     * for an instant change.
     */
    setTheme: (theme: Theme, origin?: TransitionOrigin | null) => void;
    /** Which palette is actually on screen — resolves `system` to a real value. */
    resolved: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') {
        return 'system';
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : 'system';
};

const systemPrefersDark = (): boolean =>
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(DARK_QUERY).matches;

/**
 * Parameters
 *   resolved — the palette currently on screen.
 * What it does
 *   Keeps <meta name="theme-color"> in step with the page. The stylesheet cannot
 *   do this: a media-query meta would report the OS preference, which is wrong
 *   as soon as the user forces a theme against it.
 * Output
 *   None; mutates the meta tag in place.
 */
const applyThemeClass = (theme: Theme) => {
    const root = document.documentElement;

    // Both classes come off first: the stylesheet treats "neither class" as
    // "follow the system", so a leftover class would pin the old choice.
    root.classList.remove('light', 'dark');

    const next = themeClass(theme);
    if (next) {
        root.classList.add(next);
    }
};

const applyThemeColor = (resolved: 'light' | 'dark') => {
    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', THEME_COLORS[resolved]);
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);
    const [prefersDark, setPrefersDark] = useState<boolean>(systemPrefersDark);

    // Only meaningful while the choice is `system`, but the listener is kept
    // mounted unconditionally so switching back to `system` needs no re-subscribe.
    useEffect(() => {
        if (typeof window.matchMedia !== 'function') {
            return;
        }

        const query = window.matchMedia(DARK_QUERY);
        const onChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches);

        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);

    const resolved = effectiveTheme(theme, prefersDark);

    useEffect(() => {
        // Idempotent: setTheme already applied the class inside the view
        // transition, because startViewTransition has to observe the DOM change
        // within its own callback. This re-application covers the instant path
        // and the initial mount.
        applyThemeClass(theme);
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    useEffect(() => {
        applyThemeColor(resolved);
    }, [resolved]);

    /**
     * Parameters
     *   next — the theme to switch to. origin — where the reveal spreads from,
     *   or null/undefined for an instant change.
     * What it does
     *   Applies the theme, wrapping it in the circular reveal when one is
     *   warranted. The class is written inside the transition callback because
     *   startViewTransition snapshots the document around that callback — doing
     *   it later, from an effect, would leave nothing for it to animate.
     *   flushSync forces React's own commit into the same window.
     * Output
     *   None.
     */
    const setThemeAt = useCallback((next: Theme, origin?: TransitionOrigin | null) => {
        const target = origin ?? null;

        if (!canRevealTheme(target)) {
            setTheme(next);
            return;
        }

        revealTheme(target!, () => {
            flushSync(() => setTheme(next));
            applyThemeClass(next);
        });
    }, []);

    const value = useMemo(
        () => ({ theme, setTheme: setThemeAt, resolved }),
        [theme, setThemeAt, resolved]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
};
