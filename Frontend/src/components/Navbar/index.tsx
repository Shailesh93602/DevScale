'use client';
import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiSun, FiMoon, FiChevronDown } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useSelector } from 'react-redux';
import {
  navItems,
  profileItems,
  publicNavItems,
  battleZoneItems,
} from './constants';
import { cn } from '@/lib/utils';

const Navbar = ({ isPublic }: { isPublic?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [battleZoneOpen, setBattleZoneOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const user = useSelector(
    (state: {
      user: { user: { username?: string; profilePicture?: string } };
    }) => state?.user?.user,
  );

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setDropdownOpen(!dropdownOpen);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Toggling theme from', theme, 'to', newTheme);
    setTheme(newTheme);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleBattleZone = () => {
    setBattleZoneOpen(!battleZoneOpen);
  };

  return (
    <nav
      className={cn(
        'z-50 w-full border-b border-border bg-lightSecondary text-gray-900 shadow-lg dark:text-gray-100',
        isPublic && 'sticky top-0 transition-all duration-300',
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-primary hover:text-primary2"
            >
              Mr.Eng
            </Link>
          </div>
          <div className="hidden items-center space-x-4 md:flex">
            {(isPublic ? publicNavItems : navItems).map((item, index) =>
              item.path === '/battle-zone' ? (
                <div key={index} className="relative">
                  <button
                    onClick={toggleBattleZone}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium hover:text-primary2 hover:underline',
                      battleZoneOpen && 'font-semibold text-primary',
                    )}
                  >
                    {item.label}
                    <FiChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        battleZoneOpen && 'rotate-180',
                      )}
                    />
                  </button>
                  {battleZoneOpen && (
                    <div className="absolute left-0 top-full mt-1 w-56 rounded-md border border-border bg-lightSecondary py-1 shadow-lg">
                      {battleZoneItems.map((battleItem) => (
                        <Link
                          key={battleItem.path}
                          href={battleItem.path}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-muted"
                        >
                          {battleItem.icon}
                          {battleItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavItem key={index} href={item.path}>
                  {item.label}
                </NavItem>
              ),
            )}
            <button
              onClick={toggleTheme}
              className="hover:text-gray-900 focus:outline-none dark:hover:text-gray-300"
            >
              {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>
            {!isPublic && (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="text-gray-100 hover:text-gray-300 focus:outline-none"
                >
                  <Avatar className="items-center justify-center text-3xl font-semibold">
                    <AvatarImage src={user?.profilePicture} alt="S" />
                    <AvatarFallback className="bg-red">
                      {user?.username?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-gray-100 py-1 text-gray-900 shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
                    {profileItems.map((profileItem) => (
                      <Link
                        key={profileItem.label}
                        href={profileItem.path}
                        onClick={handleLinkClick}
                        className="flex items-center gap-2 rounded-md px-4 py-2 hover:bg-light"
                      >
                        {profileItem.icon}
                        {profileItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {!isPublic && (
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-100 hover:text-gray-300 focus:outline-none"
              >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            {navItems.map((navItem, index) =>
              navItem.path === '/battle-zone' ? (
                <div key={index} className="relative">
                  <button
                    onClick={toggleBattleZone}
                    className="w-full rounded-md px-4 py-2 text-left text-gray-100 hover:bg-gray-100 focus:outline-none"
                  >
                    {navItem.label}
                    <FiChevronDown
                      className={cn(
                        'float-right h-4 w-4 transition-transform',
                        battleZoneOpen && 'rotate-180',
                      )}
                    />
                  </button>
                  {battleZoneOpen && (
                    <div className="pl-4">
                      {battleZoneItems.map((battleItem) => (
                        <Link
                          key={battleItem.path}
                          href={battleItem.path}
                          className="block rounded-md px-4 py-2 text-gray-100 hover:bg-gray-100"
                        >
                          {battleItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavItem
                  key={index}
                  href={navItem.path}
                  handleClick={handleLinkClick}
                >
                  {navItem.label}
                </NavItem>
              ),
            )}
            <button
              onClick={toggleTheme}
              className="w-full rounded-md px-4 py-2 text-left text-gray-100 hover:bg-gray-100 focus:outline-none"
            >
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="w-full rounded-md px-4 py-2 text-left text-gray-100 hover:bg-gray-100 focus:outline-none"
              >
                <Avatar className="items-center justify-center text-3xl font-semibold">
                  <AvatarImage src={user?.profilePicture} alt="S" />
                  <AvatarFallback className="bg-red">
                    {user?.username?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
              <div
                className={`absolute right-0 mt-2 w-48 rounded-md border border-border bg-lightSecondary py-1 shadow-lg ${
                  !dropdownOpen && 'hidden'
                }`}
              >
                {profileItems.map((profileItem, index) => (
                  <Link
                    key={index}
                    href={profileItem.path}
                    onClick={handleLinkClick}
                    className="block rounded-md px-4 py-2"
                  >
                    {profileItem.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavItem = ({
  href,
  children,
  handleClick,
}: {
  href?: string;
  children?: ReactNode;
  handleClick?: () => void;
}) => {
  const pathname = usePathname();

  const isActive = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href ?? ''}
      onClick={handleClick}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium hover:text-primary2 hover:underline ${
        isActive ? 'font-semibold text-primary' : ''
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar;
