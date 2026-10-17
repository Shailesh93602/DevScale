import Link from 'next/link';
import { FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { BRANDING } from '@/constants';
import { CustomLink } from '@/components/ui/custom-link';

export const LogoSection = ({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) => (
  <div className="flex shrink-0 items-center lg:w-48">
    <Link
      href={isAuthenticated ? '/dashboard' : '/'}
      className="group flex items-center gap-2 no-underline"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
        <span className="text-lg font-bold tracking-widest text-white">
          {BRANDING.name.charAt(0)}
        </span>
      </div>
      <span className="hidden bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-xl font-bold tracking-tight text-transparent transition-all duration-300 group-hover:opacity-80 sm:inline">
        {BRANDING.name}
      </span>
    </Link>
  </div>
);

export const ThemeToggle = ({
  mounted,
  resolvedTheme,
  toggleTheme,
  className,
}: {
  mounted: boolean;
  resolvedTheme: string | undefined;
  toggleTheme: () => void;
  className?: string;
}) => (
  <button
    onClick={toggleTheme}
    className={cn(
      'flex items-center justify-center rounded-full transition-colors duration-200 focus:outline-none',
      className,
    )}
    aria-label="Toggle theme"
  >
    {mounted && resolvedTheme === 'dark' ? (
      <FiSun size={15} />
    ) : (
      <FiMoon size={15} />
    )}
  </button>
);

export const PublicControls = () => (
  <div className="flex items-center gap-2">
    <CustomLink
      href="/auth/login"
      variant="ghost"
      size="sm"
      className="text-[13px] font-medium text-foreground/70 hover:text-foreground"
    >
      Log in
    </CustomLink>
    <CustomLink
      href="/auth/register"
      variant="default"
      className="h-9 rounded-full px-5 text-[13px] font-semibold shadow-sm transition-transform hover:scale-105"
    >
      Get Started
    </CustomLink>
  </div>
);

export const MobileRightControls = ({
  mounted,
  resolvedTheme,
  toggleTheme,
  toggleMenu,
  isOpen,
  isDesktop,
}: {
  mounted: boolean;
  resolvedTheme: string | undefined;
  toggleTheme: () => void;
  toggleMenu: () => void;
  isOpen: boolean;
  isDesktop: boolean;
}) => (
  <div
    className={cn(
      'flex shrink-0 items-center justify-end gap-2 lg:hidden',
      isDesktop && 'hidden',
    )}
  >
    <ThemeToggle
      mounted={mounted}
      resolvedTheme={resolvedTheme}
      toggleTheme={toggleTheme}
      className="h-11 w-11 text-foreground/70 hover:bg-foreground/5"
    />
    <button
      onClick={toggleMenu}
      className="flex h-11 w-11 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/5 focus:outline-none"
      aria-expanded={isOpen}
      aria-label="Toggle menu"
    >
      {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
    </button>
  </div>
);
