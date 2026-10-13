import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const NavItem = ({
  href,
  children,
  handleClick,
  isMobile = false,
  isPill = false,
}: {
  href?: string;
  children?: ReactNode;
  handleClick?: () => void;
  isMobile?: boolean;
  isPill?: boolean;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(`${href}/`);

  if (isMobile) {
    return (
      <Link
        href={href ?? ''}
        prefetch={true}
        onClick={handleClick}
        className={cn(
          'flex items-center rounded-xl px-4 py-3 text-[14px] font-medium no-underline transition-all duration-200',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-foreground/80 hover:bg-foreground/5 hover:text-foreground',
        )}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href ?? ''}
      prefetch={true}
      onClick={handleClick}
      className={cn(
        'group relative flex h-9 items-center justify-center rounded-full px-5 text-[14px] font-bold no-underline transition-all duration-300',
        isActive
          ? 'text-primary'
          : 'hover:bg-primary/5 text-muted-foreground hover:text-primary',
        isPill && 'py-1',
      )}
    >
      <span className="relative z-10 tracking-tight">{children}</span>
      {isActive && (
        <motion.div
          layoutId="navbar-pill"
          className="bg-primary/10 absolute inset-0 rounded-full shadow-sm"
          transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
        />
      )}
    </Link>
  );
};
