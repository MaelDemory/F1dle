import { canRevealTheme, originFromElement, THEME_TRANSITION_DURATION_MS } from './viewTransition';

const stubMatchMedia = (reduced: boolean) => {
    (window as any).matchMedia = (query: string) => ({
        matches: query.includes('reduced-motion') ? reduced : false,
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined
    });
};

const withViewTransitionSupport = (supported: boolean) => {
    if (supported) {
        (document as any).startViewTransition = () => ({});
    } else {
        delete (document as any).startViewTransition;
    }
};

beforeEach(() => {
    stubMatchMedia(false);
    withViewTransitionSupport(true);
});

describe('originFromElement', () => {
    it('takes the element centre, so the reveal starts where the user pressed', () => {
        const element = document.createElement('button');
        element.getBoundingClientRect = () =>
            ({ top: 100, left: 40, width: 60, height: 20 }) as DOMRect;

        expect(originFromElement(element)).toEqual({ x: 70, y: 110 });
    });

    it('returns null without an element to measure', () => {
        expect(originFromElement(null)).toBeNull();
    });
});

describe('canRevealTheme', () => {
    const origin = { x: 10, y: 10 };

    it('animates when there is an origin, support, and no reduced-motion request', () => {
        expect(canRevealTheme(origin)).toBe(true);
    });

    it('declines without an origin to spread from', () => {
        expect(canRevealTheme(null)).toBe(false);
    });

    it('declines when the browser has no View Transitions support', () => {
        withViewTransitionSupport(false);
        expect(canRevealTheme(origin)).toBe(false);
    });

    // The reveal is a full-viewport wipe — precisely what this preference is about.
    it('declines when the user asked for reduced motion', () => {
        stubMatchMedia(true);
        expect(canRevealTheme(origin)).toBe(false);
    });
});

describe('THEME_TRANSITION_DURATION_MS', () => {
    it('matches the portfolio toggler it was ported from', () => {
        expect(THEME_TRANSITION_DURATION_MS).toBe(400);
    });
});
