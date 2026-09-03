import type { Transition, Variants } from 'motion/react';

// Spring tokens — Apple-style: critically damped by default, bounce only for momentum.
export const spring: Transition = { type: 'spring', bounce: 0, duration: 0.35 };
export const springFast: Transition = { type: 'spring', bounce: 0, duration: 0.25 };
export const springBouncy: Transition = { type: 'spring', bounce: 0.2, duration: 0.4 };

// Modal "materialize" recipe: blur, scale and opacity move together so the
// surface reads as a material arriving, not a plain fade.
export const modalMaterialize: Variants = {
    hidden: { opacity: 0, scale: 0.96, filter: 'blur(8px)' },
    visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: spring },
    exit: { opacity: 0, scale: 0.96, filter: 'blur(8px)', transition: springFast },
};

export const scrimFade: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
};

/**
 * staggerContainer
 * Parameters
 *   stagger: seconds between each child entrance
 *   delayChildren: seconds before the first child starts
 * What it does
 *   Builds a parent variants object that staggers its children's "visible" state.
 * Output
 *   A Variants object for a motion container.
 */
export const staggerContainer = (stagger = 0.05, delayChildren = 0): Variants => ({
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
});

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: spring },
};
