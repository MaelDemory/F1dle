import React, { ReactNode, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { modalMaterialize, scrimFade } from '../../lib/motion';
import { cn } from '../../lib/utils';

type ModalProps = {
    open: boolean;
    onClose: () => void;
    size?: 'md' | 'lg';
    children: ReactNode;
    className?: string;
};

const sizeClasses = { md: 'max-w-lg', lg: 'max-w-2xl' };

// Reduced motion: the material recipe (scale + blur) collapses to a cross-fade.
const reducedFade = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const Modal = ({ open, onClose, size = 'md', children, className }: ModalProps) => {
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-40 grid place-items-center px-4">
                    <motion.div
                        className="absolute inset-0 bg-scrim/50"
                        variants={scrimFade}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        className={cn(
                            'relative w-full rounded-xl border border-border bg-surface/85 p-6 shadow-3 backdrop-blur-2xl sm:p-8',
                            sizeClasses[size],
                            className
                        )}
                        variants={prefersReducedMotion ? reducedFade : modalMaterialize}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
