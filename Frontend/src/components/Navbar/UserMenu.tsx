import Link from 'next/link';
import { FiChevronDown, FiShield } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { IUser } from '@/types';
import { profileItems } from './constants';

export const UserMenu = ({
  user,
  userInitials,
  isAdmin,
  dropdownOpen,
  toggleDropdown,
  handleLinkClick,
}: {
  user: IUser | null;
  userInitials: string;
  isAdmin: boolean;
  dropdownOpen: boolean;
  toggleDropdown: () => void;
  handleLinkClick: () => void;
}) => (
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
        <AvatarFallback className="bg-primary text-[11px] font-black uppercase text-primary-foreground">
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
          'mr-1.5 h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 group-hover:text-foreground',
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
            <p className="px-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
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
                </span>{' '}
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
                    'flex h-7 w-7 items-center justify-center rounded-md bg-foreground/5 text-foreground/80 transition-colors group-hover:text-foreground',
                    profileItem.label === 'Logout' &&
                      'bg-symbols/5 text-red-400',
                  )}
                >
                  {profileItem.icon}
                </span>{' '}
                {profileItem.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
