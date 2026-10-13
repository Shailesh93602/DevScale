import Link from 'next/link';
import { FiShield } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { CustomLink } from '@/components/ui/custom-link';
import {
  battleZoneItems,
  NavItem as INavItem,
  profileItems,
} from './constants';
import { NavItem } from './NavItem';

export const MobileMenuOverlay = ({
  isOpen,
  isDesktop,
  navList,
  showPublicNavbar,
  isAdmin,
  handleLinkClick,
  closeAllMenus,
}: {
  isOpen: boolean;
  isDesktop: boolean;
  navList: INavItem[];
  showPublicNavbar: boolean;
  isAdmin: boolean;
  handleLinkClick: () => void;
  closeAllMenus: () => void;
}) => {
  if (isDesktop) return null;

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close mobile menu"
          onClick={closeAllMenus}
          className="fixed inset-0 top-[60px] z-[999] bg-black/20 backdrop-blur-[2px] lg:hidden"
        />
      )}
      <div
        className={cn(
          'absolute inset-x-0 top-[60px] z-[1000] border-t border-border/40 bg-background/95 backdrop-blur-xl transition-all duration-300 ease-in-out lg:hidden',
          isOpen ? 'pointer-events-auto block' : 'pointer-events-none hidden',
        )}
      >
        <div className="max-h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden">
          <div className="space-y-1 px-4 pb-6 pt-4">
            {navList.map((navItem) =>
              navItem.path === '/battle-zone' ? (
                <div key="mobile-battle-zone" className="space-y-1">
                  <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-foreground/80">
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
                  key={navItem.path}
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
                  {profileItems.map((profileItem) => (
                    <Link
                      key={profileItem.path}
                      href={profileItem.path}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium text-foreground/80 no-underline transition-colors hover:bg-foreground/5 hover:text-foreground"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 text-foreground/80">
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
    </>
  );
};
