import Link from 'next/link';
import { FiChevronDown } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { battleZoneItems, NavItem as INavItem } from './constants';
import { NavItem } from './NavItem';

export const DesktopNav = ({
  showPublicNavbar,
  navList,
  battleZoneOpen,
  toggleBattleZone,
  handleLinkClick,
}: {
  showPublicNavbar: boolean;
  navList: INavItem[];
  battleZoneOpen: boolean;
  toggleBattleZone: () => void;
  handleLinkClick: () => void;
}) => (
  <div className="hidden flex-1 items-center justify-center px-6 lg:flex">
    <div
      className={cn(
        'flex items-center gap-1 rounded-full p-1 transition-all duration-300',
        showPublicNavbar
          ? 'bg-transparent'
          : 'bg-muted/40 text-muted-foreground shadow-inner ring-1 ring-border/40 backdrop-blur-md',
      )}
    >
      {navList.map((item) =>
        item.path === '/battle-zone' ? (
          <div key="battle-zone" className="relative">
            <button
              onClick={toggleBattleZone}
              className={cn(
                'flex h-9 items-center gap-1.5 rounded-full px-4 text-[14px] font-bold transition-all duration-200 focus:outline-none',
                battleZoneOpen
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-primary',
              )}
            >
              {item.label}
              <FiChevronDown
                className={cn(
                  'h-3.5 w-3.5 opacity-50 transition-transform duration-300',
                  battleZoneOpen && 'rotate-180 text-primary opacity-100',
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
                        className="group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-foreground/70 no-underline transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground/5 transition-all group-hover:scale-110 group-hover:bg-primary/20 group-hover:text-primary">
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
            key={item.path}
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
);
