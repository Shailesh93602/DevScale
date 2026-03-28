'use client';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiChevronDown,
  FiShield,
} from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  navItems,
  profileItems,
  publicNavItems,
  battleZoneItems,
} from './constants';
import { cn } from '@/lib/utils';
import { BRANDING } from '@/constants';
import { CustomLink } from '@/components/ui/custom-link';
import { getInitials } from '@/lib/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { requiresAuthRoute } from '@/lib/public-routes';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [battleZoneOpen, setBattleZoneOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const { user, isAuthenticated, isAdmin } = useAuth();
  const isProtectedPath = requiresAuthRoute(pathname);

  const showPublicNavbar = !isAuthenticated && !isProtectedPath;
  const navList = showPublicNavbar ? publicNavItems : navItems;

  const userInitials = useMemo(
    () =>
      getInitials(
        `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '',
        user?.username,
      ),
    [user?.first_name, user?.last_name, user?.username],
  );

  const closeAllMenus = useCallback(() => {
    setIsOpen(false);
    setDropdownOpen(false);
    setBattleZoneOpen(false);
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        closeAllMenus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeAllMenus, isDesktop]);

  useEffect(() => {
    closeAllMenus();
  }, [pathname, closeAllMenus]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    setMounted(true);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const handleLinkClick = () => closeAllMenus();
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    setBattleZoneOpen(false);
  };
  const toggleBattleZone = () => {
    setBattleZoneOpen(!battleZoneOpen);
    setDropdownOpen(false);
  };

  return (
    <nav
      ref={navRef}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-white/5 bg-background/90 shadow-2xl backdrop-blur-2xl'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[60px] items-center justify-between">
          {/* Logo Section */}
          <div className="flex shrink-0 items-center lg:w-48">
            <Link
              href={isAuthenticated ? '/dashboard' : '/'}
              className="group flex items-center gap-2 no-underline"
            >
              <div className="shadow-primary/20 flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg">
                <span className="text-lg font-bold tracking-widest text-white">
                  {BRANDING.name.charAt(0)}
                </span>
              </div>
              <span className="hidden bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-xl font-bold tracking-tight text-transparent transition-all duration-300 group-hover:opacity-80 sm:inline">
                {BRANDING.name}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden flex-1 items-center justify-center px-6 lg:flex">
            <div
              className={cn(
                'flex items-center gap-1 rounded-full p-1 transition-all duration-300',
                showPublicNavbar
                  ? 'bg-transparent'
                  : 'bg-muted/40 text-muted-foreground shadow-inner ring-1 ring-border/40 backdrop-blur-md',
              )}
            >
              {navList.map((item, index) =>
                item.path === '/battle-zone' ? (
                  <div key={index} className="relative">
                    <button
                      onClick={toggleBattleZone}
                      className={cn(
                        'flex h-9 items-center gap-1.5 rounded-full px-4 text-[14px] font-bold transition-all duration-200 focus:outline-none',
                        battleZoneOpen
                          ? 'bg-primary/10 text-primary shadow-sm'
                          : 'hover:bg-primary/5 text-muted-foreground hover:text-primary',
                      )}
                    >
                      {item.label}
                      <FiChevronDown
                        className={cn(
                          'h-3.5 w-3.5 opacity-50 transition-transform duration-300',
                          battleZoneOpen &&
                            'rotate-180 text-primary opacity-100',
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {battleZoneOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="absolute left-1/2 top-full mt-3 w-[240px] -translate-x-1/2 overflow-hidden rounded-2xl border border-border/50 bg-popover/95 shadow-[0_20px_50px_rgba(0,0,0,0.2)] ring-1 ring-white/10 backdrop-blur-xl"
                        >
                          <div className="grid gap-0.5 p-1.5">
                            {battleZoneItems.map((battleItem) => (
                              <Link
                                key={battleItem.path}
                                href={battleItem.path}
                                prefetch={true}
                                onClick={handleLinkClick}
                                className="hover:bg-primary/10 group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-foreground/70 no-underline transition-all duration-200 hover:text-primary"
                              >
                                <div className="group-hover:bg-primary/20 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground/5 transition-all group-hover:scale-110 group-hover:text-primary">
                                  {battleItem.icon}
                                </div>
                                {battleItem.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <NavItem
                    key={index}
                    href={item.path}
                    handleClick={handleLinkClick}
                    isPill={!showPublicNavbar}
                  >
                    {item.label}
                  </NavItem>
                ),
              )}
            </div>
          </div>

          {/* Right Controls - Desktop Only */}
          <div className="hidden shrink-0 items-center justify-end gap-3 lg:flex lg:w-48">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/40 bg-background/50 text-foreground/60 shadow-sm backdrop-blur-lg transition-colors duration-200 hover:bg-foreground/5 hover:text-foreground focus:outline-none"
              aria-label="Toggle theme"
            >
              {mounted && resolvedTheme === 'dark' ? (
                <FiSun size={15} />
              ) : (
                <FiMoon size={15} />
              )}
            </button>

            {showPublicNavbar ? (
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
            ) : (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className={cn(
                    'group relative flex h-[42px] items-center gap-2.5 rounded-full border border-border/60 bg-card/50 px-1.5 shadow-sm transition-all duration-300 hover:bg-card focus:outline-none',
                    dropdownOpen &&
                      'ring-primary/20 border-primary/40 bg-zinc-800/80 ring-4',
                  )}
                  aria-label="User Profile Menu"
                >
                  <Avatar className="h-8 w-8 border border-border/20 shadow-lg">
                    <AvatarImage
                      src={user?.avatar_url}
                      alt={user?.username || 'User avatar'}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary text-[11px] font-black uppercase text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mr-1 hidden flex-col items-start gap-0 leading-none lg:flex">
                    <span className="text-[13px] font-bold text-foreground transition-colors">
                      {user?.first_name || user?.username}
                    </span>
                  </div>
                  <FiChevronDown
                    className={cn(
                      'mr-1.5 h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-300 group-hover:text-foreground',
                      dropdownOpen && 'rotate-180',
                    )}
                  />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-border/50 bg-popover/95 shadow-[0_20px_50px_rgba(0,0,0,0.2)] ring-1 ring-white/10 backdrop-blur-xl"
                    >
                      <div className="border-b border-border/40 bg-foreground/5 p-1 px-2 py-2">
                        <p className="px-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                          Account
                        </p>
                      </div>
                      <div className="grid gap-0.5 p-1.5">
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={handleLinkClick}
                            className="hover:bg-primary/10 flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold text-primary no-underline transition-all duration-200"
                          >
                            <span className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-md text-primary">
                              <FiShield size={14} />
                            </span>
                            Admin Panel
                          </Link>
                        )}
                        {profileItems.map((profileItem) => (
                          <Link
                            key={profileItem.label}
                            href={profileItem.path}
                            onClick={handleLinkClick}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium no-underline transition-all duration-200',
                              profileItem.label === 'Logout'
                                ? 'text-red-500 hover:bg-red-50'
                                : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground',
                            )}
                          >
                            <span
                              className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-md bg-foreground/5 text-foreground/40 transition-colors group-hover:text-foreground',
                                profileItem.label === 'Logout' &&
                                  'bg-symbols/5 text-red-400',
                              )}
                            >
                              {profileItem.icon}
                            </span>
                            {profileItem.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Right Section - Shown Only When Desktop Hidden */}
          <div
            className={cn(
              'flex shrink-0 items-center justify-end gap-2 lg:hidden',
              isDesktop && 'hidden',
            )}
          >
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/5 focus:outline-none"
            >
              {mounted && resolvedTheme === 'dark' ? (
                <FiSun size={16} />
              ) : (
                <FiMoon size={16} />
              )}
            </button>
            <button
              onClick={toggleMenu}
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/5 focus:outline-none"
              aria-expanded={isOpen}
            >
              {isOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && !isDesktop && (
        <button
          type="button"
          aria-label="Close mobile menu"
          onClick={closeAllMenus}
          className="fixed inset-0 top-[60px] z-[70] bg-black/20 lg:hidden"
        />
      )}

      <div
        className={cn(
          'absolute inset-x-0 top-[60px] z-[80] border-t border-border/40 bg-background/95 backdrop-blur-xl transition-all duration-300 ease-in-out lg:hidden',
          isDesktop && 'hidden',
          isOpen ? 'pointer-events-auto block' : 'pointer-events-none hidden',
        )}
      >
        <div className="max-h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden">
          <div className="space-y-1 px-4 pb-6 pt-4">
            {navList.map((navItem, index) =>
              navItem.path === '/battle-zone' ? (
                <div key={index} className="space-y-1">
                  <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-foreground/50">
                    Battle Zone
                  </p>
                  <div className="ml-2 space-y-1 border-l border-border/40 pl-3">
                    {battleZoneItems.map((battleItem) => (
                      <Link
                        key={battleItem.path}
                        href={battleItem.path}
                        prefetch={true}
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[14px] font-medium text-foreground/75 no-underline transition-colors hover:bg-foreground/5 hover:text-foreground"
                      >
                        <span className="text-primary/70">
                          {battleItem.icon}
                        </span>
                        {battleItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <NavItem
                  key={index}
                  href={navItem.path}
                  handleClick={handleLinkClick}
                  isMobile
                >
                  {navItem.label}
                </NavItem>
              ),
            )}

            <div className="my-4 border-t border-border/40" />

            <div className="px-2">
              {showPublicNavbar ? (
                <div className="mt-4 grid gap-2">
                  <CustomLink
                    variant="outline"
                    className="w-full rounded-xl py-5 text-sm font-medium"
                    href="/auth/login"
                    onClick={handleLinkClick}
                  >
                    Log in
                  </CustomLink>
                  <CustomLink
                    variant="default"
                    className="w-full rounded-xl py-5 text-sm font-medium shadow-sm"
                    href="/auth/register"
                    onClick={handleLinkClick}
                  >
                    Get Started
                  </CustomLink>
                </div>
              ) : (
                <div className="mt-2 space-y-1">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={handleLinkClick}
                      className="hover:bg-primary/5 flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-semibold text-primary no-underline transition-colors"
                    >
                      <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg text-primary">
                        <FiShield size={16} />
                      </div>
                      Admin Panel
                    </Link>
                  )}
                  {profileItems.map((profileItem, index) => (
                    <Link
                      key={index}
                      href={profileItem.path}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium text-foreground/80 no-underline transition-colors hover:bg-foreground/5 hover:text-foreground"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 text-foreground/50">
                        {profileItem.icon}
                      </div>
                      {profileItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({
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

export default Navbar;
