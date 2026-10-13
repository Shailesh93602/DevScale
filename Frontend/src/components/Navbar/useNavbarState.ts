import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useMediaQuery } from '@/hooks/use-media-query';
import { getInitials } from '@/lib/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { requiresAuthRoute } from '@/lib/public-routes';
import { navItems, publicNavItems } from './constants';

/** Lock page scroll while `locked`, restoring the PREVIOUS overflow so other scroll-lockers are not clobbered. */
function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}

/** Menu open/closed state, theme, scroll and auth-derived nav data for the navbar. */
export function useNavbarState() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [battleZoneOpen, setBattleZoneOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const navRef = useRef<HTMLElement>(null);

  useBodyScrollLock(isOpen);
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
    requestAnimationFrame(() => {
      setIsOpen(false);
      setDropdownOpen(false);
      setBattleZoneOpen(false);
    });
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    requestAnimationFrame(() => setMounted(true));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    navRef,
    isOpen,
    dropdownOpen,
    battleZoneOpen,
    scrolled,
    mounted,
    resolvedTheme,
    isDesktop,
    user,
    isAdmin,
    isAuthenticated,
    showPublicNavbar,
    navList,
    userInitials,
    closeAllMenus,
    toggleMenu: () => setIsOpen(!isOpen),
    toggleTheme: () => setTheme(resolvedTheme === 'light' ? 'dark' : 'light'),
    toggleDropdown: () => {
      setDropdownOpen(!dropdownOpen);
      setBattleZoneOpen(false);
    },
    toggleBattleZone: () => {
      setBattleZoneOpen(!battleZoneOpen);
      setDropdownOpen(false);
    },
  };
}
