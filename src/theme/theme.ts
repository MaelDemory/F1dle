/**
 * The three states a user can pick. `system` is not a colour — it defers to the
 * OS, which the CSS already handles on its own through prefers-color-scheme.
 */
export type Theme = 'light' | 'dark' | 'system';

export const THEMES: Theme[] = ['light', 'dark', 'system'];

export const THEME_STORAGE_KEY = 'f1dle-theme';

/** Browser-chrome colours, kept in step with --background in index.css. */
export const THEME_COLORS = {
    light: '#f7f7f8',
    dark: '#0e0e10'
} as const;

/**
 * Parameters
 *   value — anything read back from storage.
 * What it does
 *   Narrows untrusted input to a Theme. Storage is user-writable and survives
 *   across deploys, so a stale or hand-edited value must not put the UI in an
 *   undefined state.
 * Output
 *   True when the value is one of the three known themes.
 */
export const isTheme = (value: unknown): value is Theme =>
    typeof value === 'string' && (THEMES as string[]).includes(value);

/**
 * Parameters
 *   theme — the user's choice.
 * What it does
 *   Maps a choice to the class that must sit on <html>. The stylesheet reads
 *   `.light` as "force light", `.dark` as "force dark", and the absence of both
 *   as "follow the system" — so `system` deliberately maps to no class.
 * Output
 *   The class name to apply, or null when no class should be set.
 */
export const themeClass = (theme: Theme): 'light' | 'dark' | null =>
    theme === 'system' ? null : theme;

/**
 * Parameters
 *   theme — the user's choice. systemPrefersDark — the OS preference.
 * What it does
 *   Resolves which of the two palettes is actually on screen. Needed because
 *   `system` alone does not say, and the browser-chrome colour has to name a
 *   concrete value.
 * Output
 *   'light' or 'dark'.
 */
export const effectiveTheme = (theme: Theme, systemPrefersDark: boolean): 'light' | 'dark' => {
    if (theme === 'system') {
        return systemPrefersDark ? 'dark' : 'light';
    }

    return theme;
};
