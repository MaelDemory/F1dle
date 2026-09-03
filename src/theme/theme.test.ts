import { effectiveTheme, isTheme, THEME_COLORS, themeClass } from './theme';

describe('isTheme', () => {
    it('accepts the three known themes', () => {
        expect(isTheme('light')).toBe(true);
        expect(isTheme('dark')).toBe(true);
        expect(isTheme('system')).toBe(true);
    });

    it('rejects anything else, since storage is user-writable', () => {
        expect(isTheme('auto')).toBe(false);
        expect(isTheme('')).toBe(false);
        expect(isTheme(null)).toBe(false);
        expect(isTheme(undefined)).toBe(false);
        expect(isTheme(1)).toBe(false);
        expect(isTheme({ theme: 'dark' })).toBe(false);
    });
});

describe('themeClass', () => {
    it('forces a palette with an explicit class', () => {
        expect(themeClass('light')).toBe('light');
        expect(themeClass('dark')).toBe('dark');
    });

    it('applies no class for system, which is how the stylesheet defers to the OS', () => {
        expect(themeClass('system')).toBeNull();
    });
});

describe('effectiveTheme', () => {
    it('ignores the OS when a theme is forced', () => {
        expect(effectiveTheme('light', true)).toBe('light');
        expect(effectiveTheme('dark', false)).toBe('dark');
    });

    it('follows the OS in system mode', () => {
        expect(effectiveTheme('system', true)).toBe('dark');
        expect(effectiveTheme('system', false)).toBe('light');
    });
});

describe('THEME_COLORS', () => {
    // These must track --background in index.css, or the browser chrome will not
    // match the page it frames.
    it('matches the light and dark backgrounds', () => {
        expect(THEME_COLORS.light).toBe('#f7f7f8');
        expect(THEME_COLORS.dark).toBe('#0e0e10');
    });
});
