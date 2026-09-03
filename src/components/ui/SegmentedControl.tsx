import React, { useId } from 'react';
import { motion } from 'motion/react';
import { spring } from '../../lib/motion';
import { cn } from '../../lib/utils';

type SegmentedControlProps<T extends string> = {
    options: { value: T; label: string }[];
    value: T;
    /**
     * `element` is the segment that was clicked. Handlers that do not need it
     * simply ignore it; ThemeSwitch uses it to anchor its reveal animation.
     */
    onChange: (value: T, element: HTMLButtonElement) => void;
    className?: string;
};

export function SegmentedControl<T extends string>({ options, value, onChange, className }: SegmentedControlProps<T>) {
    const layoutId = useId();

    return (
        <div className={cn('inline-flex items-center gap-1 rounded-md border border-border bg-surface p-1 shadow-1', className)}>
            {options.map((option) => {
                const isActive = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={(event) => onChange(option.value, event.currentTarget)}
                        className={cn(
                            'relative rounded-sm px-4 py-1.5 text-footnote font-semibold transition-colors',
                            isActive ? 'text-foreground' : 'text-tertiary hover:text-secondary'
                        )}
                    >
                        {isActive && (
                            <motion.span
                                layoutId={layoutId}
                                transition={spring}
                                className="absolute inset-0 rounded-sm bg-surface-raised shadow-1"
                            />
                        )}
                        <span className="relative">{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
