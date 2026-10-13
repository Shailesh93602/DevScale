'use client';
import { DesktopNav } from './DesktopNav';
import { MobileMenuOverlay } from './MobileMenuOverlay';
import {
  LogoSection,
  MobileRightControls,
  PublicControls,
  ThemeToggle,
} from './NavControls';
import { UserMenu } from './UserMenu';
import { cn } from '@/lib/utils';
import { useNavbarState } from './useNavbarState';

const Navbar = () => {
  const {
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
    toggleMenu,
    toggleTheme,
    toggleDropdown,
    toggleBattleZone,
  } = useNavbarState();
  const handleLinkClick = () => closeAllMenus();

  return (
    <nav
      ref={navRef}
      className={cn(
        'fixed inset-x-0 top-0 z-[1000] transition-all duration-300',
        scrolled
          ? 'border-b border-white/5 bg-background/90 shadow-2xl backdrop-blur-2xl'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[60px] items-center justify-between">
          {/* Logo Section */}
          <LogoSection isAuthenticated={isAuthenticated} />

          {/* Desktop Navigation Links */}
          <DesktopNav
            showPublicNavbar={showPublicNavbar}
            navList={navList}
            battleZoneOpen={battleZoneOpen}
            toggleBattleZone={toggleBattleZone}
            handleLinkClick={handleLinkClick}
          />

          {/* Right Controls - Desktop Only */}
          <div className="hidden shrink-0 items-center justify-end gap-3 lg:flex lg:w-48">
            <ThemeToggle
              mounted={mounted}
              resolvedTheme={resolvedTheme}
              toggleTheme={toggleTheme}
              className="h-11 w-11 border border-border/40 bg-background/50 text-foreground/60 shadow-sm backdrop-blur-lg hover:bg-foreground/5 hover:text-foreground"
            />

            {showPublicNavbar ? (
              <PublicControls />
            ) : (
              <UserMenu
                user={user}
                userInitials={userInitials}
                isAdmin={isAdmin}
                dropdownOpen={dropdownOpen}
                toggleDropdown={toggleDropdown}
                handleLinkClick={handleLinkClick}
              />
            )}
          </div>

          {/* Mobile Right Section - Shown Only When Desktop Hidden */}
          <MobileRightControls
            mounted={mounted}
            resolvedTheme={resolvedTheme}
            toggleTheme={toggleTheme}
            toggleMenu={toggleMenu}
            isOpen={isOpen}
            isDesktop={isDesktop}
          />
        </div>
      </div>

      {isOpen && !isDesktop && (
        <button
          type="button"
          aria-label="Close mobile menu"
          onClick={closeAllMenus}
          className="fixed inset-0 top-[60px] z-[999] bg-black/20 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <MobileMenuOverlay
        isOpen={isOpen}
        isDesktop={isDesktop}
        navList={navList}
        showPublicNavbar={showPublicNavbar}
        isAdmin={isAdmin}
        handleLinkClick={handleLinkClick}
        closeAllMenus={closeAllMenus}
      />
    </nav>
  );
};

export default Navbar;
