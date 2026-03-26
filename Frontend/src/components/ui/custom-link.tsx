'use client';

import * as React from 'react';
import Link, { LinkProps as NextLinkProps } from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * CustomLink variants.
 *
 * Use this component instead of bare <Link> or <Button asChild><Link>.
 *
 * Variants:
 *  - default   → filled primary-colour button (use for primary CTAs)
 *  - secondary → bordered button with accent on hover
 *  - outline   → border / transparent bg
 *  - ghost     → transparent, subtle hover
 *  - link      → inline text link with underline on hover (default when no variant given)
 *  - nav       → navigation pill – no underline, hover highlight
 */
const customLinkVariants = cva(
  // base – shared by every variant
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        /** Filled primary button */
        default:
          'bg-primary text-primary-foreground rounded-md shadow hover:bg-primary/90 no-underline',
        /** Outlined / secondary button */
        secondary:
          'border border-primary bg-background text-primary rounded-md shadow-sm hover:bg-primary/10 no-underline',
        /** Border only */
        outline:
          'border border-input bg-background rounded-md shadow-sm hover:bg-accent hover:text-accent-foreground no-underline',
        /** Ghost – transparent */
        ghost:
          'hover:bg-accent hover:text-accent-foreground rounded-md no-underline',
        /** Inline text link */
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
        /** Navbar / pill navigation item */
        nav: 'text-foreground/80 hover:text-foreground hover:bg-foreground/5 rounded-full no-underline',
      },
      size: {
        default: 'h-9 px-4 py-2 text-sm',
        sm: 'h-8 px-3 text-xs rounded-md',
        lg: 'h-10 px-8 text-base rounded-md',
        xl: 'h-12 px-10 text-lg rounded-full',
        icon: 'h-9 w-9',
        /** No fixed size – for inline links */
        none: '',
      },
    },
    defaultVariants: {
      variant: 'link',
      size: 'none',
    },
  },
);

export interface CustomLinkProps
  extends Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      keyof NextLinkProps
    >,
    NextLinkProps,
    VariantProps<typeof customLinkVariants> {}

const CustomLink = React.forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ className, variant, size, ...props }, ref) => {
    // If a button-like variant is used without an explicit size, fall back to 'default' size.
    const buttonVariants = ['default', 'secondary', 'outline', 'ghost'];
    const resolvedSize =
      size !== undefined
        ? size
        : buttonVariants.includes(variant ?? 'link')
          ? 'default'
          : 'none';

    return (
      <Link
        ref={ref}
        className={cn(
          customLinkVariants({ variant, size: resolvedSize }),
          className,
        )}
        {...props}
      />
    );
  },
);
CustomLink.displayName = 'CustomLink';

export { CustomLink, customLinkVariants };
