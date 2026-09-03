/**
 * The circular theme reveal, ported from the portfolio's AnimatedThemeToggler.
 *
 * The View Transitions API is not in TypeScript's DOM library at this version,
 * so the shape used here is declared locally rather than widening the global
 * Document type.
 */
type ViewTransition = {
    ready?: Promise<void>;
    finished?: Promise<void>;
};

type DocumentWithViewTransition = Document & {
    startViewTransition?: (callback: () => void) => ViewTransition;
};

export type TransitionOrigin = { x: number; y: number };

export const THEME_TRANSITION_DURATION_MS = 400;

/**
 * Parameters
 *   element — the control that triggered the change, or null.
 * What it does
 *   Takes the element's centre as the reveal's origin, so the new theme appears
 *   to spread from what the user actually clicked.
 * Output
 *   Viewport coordinates, or null when there is no element to measure.
 */
export const originFromElement = (element: Element | null): TransitionOrigin | null => {
    if (!element) {
        return null;
    }

    const { top, left, width, height } = element.getBoundingClientRect();

    return { x: left + width / 2, y: top + height / 2 };
};

const prefersReducedMotion = (): boolean =>
    typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Parameters
 *   origin — where the reveal should start from.
 * What it does
 *   Decides whether to animate at all. Three reasons not to: no origin to spread
 *   from, no View Transitions support, or a user who asked for reduced motion —
 *   the reveal is a full-viewport wipe, exactly what that preference is about.
 * Output
 *   True when the circular reveal should run.
 */
export const canRevealTheme = (origin: TransitionOrigin | null): boolean =>
    origin !== null
    && typeof (document as DocumentWithViewTransition).startViewTransition === 'function'
    && !prefersReducedMotion();

/**
 * Parameters
 *   origin — reveal centre. apply — mutates the theme; must run synchronously.
 *   duration — animation length in milliseconds.
 * What it does
 *   Runs `apply` inside a view transition and animates the new snapshot's
 *   clip-path outward from `origin` to a radius covering the furthest viewport
 *   corner. `theme-switching` is set for the duration so element transitions do
 *   not smear across the reveal, and the CSS custom properties give the
 *   stylesheet the same origin as the fallback clip-path.
 *
 *   Callers must check canRevealTheme first; this assumes support.
 * Output
 *   None; cleans up its class and custom properties when the transition settles.
 */
export const revealTheme = (
    origin: TransitionOrigin,
    apply: () => void,
    duration: number = THEME_TRANSITION_DURATION_MS
): void => {
    const root = document.documentElement;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const maxRadius = Math.hypot(
        Math.max(origin.x, viewportWidth - origin.x),
        Math.max(origin.y, viewportHeight - origin.y)
    );

    root.style.setProperty('--theme-transition-x', `${origin.x}px`);
    root.style.setProperty('--theme-transition-y', `${origin.y}px`);
    root.classList.add('theme-switching');

    const cleanup = () => {
        root.classList.remove('theme-switching');
        root.style.removeProperty('--theme-transition-x');
        root.style.removeProperty('--theme-transition-y');
    };

    const transition = (document as DocumentWithViewTransition).startViewTransition!(apply);

    transition.ready
        ?.then(() => {
            root.animate(
                {
                    clipPath: [
                        `circle(0px at ${origin.x}px ${origin.y}px)`,
                        `circle(${maxRadius}px at ${origin.x}px ${origin.y}px)`
                    ]
                },
                {
                    duration,
                    easing: 'ease-in-out',
                    fill: 'both',
                    pseudoElement: '::view-transition-new(root)'
                }
            );
        })
        .catch(() => undefined);

    if (transition.finished) {
        transition.finished.then(cleanup).catch(cleanup);
    } else {
        window.setTimeout(cleanup, duration);
    }
};
