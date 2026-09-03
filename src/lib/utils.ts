import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn
 * Parameters
 *   inputs: class values (strings, arrays, conditionals)
 * What it does
 *   Merges class names with clsx then resolves Tailwind conflicts with tailwind-merge.
 * Output
 *   A single merged class string.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
