import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
    {
        variants: {
            variant: {
                primary: 'bg-accent text-accent-foreground hover:bg-accent/90',
                secondary: 'border border-border bg-surface text-foreground hover:bg-surface-raised',
                ghost: 'text-secondary hover:bg-surface-raised hover:text-foreground',
                destructive: 'bg-danger text-white hover:bg-danger/90',
            },
            size: {
                sm: 'h-8 px-3 text-footnote',
                md: 'h-10 px-4 text-callout',
                lg: 'h-12 px-6 text-callout',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
    }
);
Button.displayName = 'Button';
