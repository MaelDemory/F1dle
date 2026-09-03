import { useEffect, useState } from 'react';

/**
 * useScrollEdge
 * Parameters
 *   threshold: scroll offset in px past which content is considered under the chrome
 * What it does
 *   Tracks whether the page is scrolled past the threshold, for scroll-edge
 *   effects on floating chrome (header background + hairline).
 * Output
 *   true when window.scrollY > threshold.
 */
export function useScrollEdge(threshold = 8) {
    const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > threshold);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > threshold);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);

    return scrolled;
}
