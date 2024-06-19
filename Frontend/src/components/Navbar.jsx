"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiSun, FiMoon, FiUser } from "react-icons/fi";
import { useTheme } from "next-themes";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  if (!mounted) {
    return null;
  }

  return (

    <nav className="bg-blue-500 shadow-lg w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-100">
              Mr.Eng
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-gray-100">
            <NavItem href="/dashboard" pathname={pathname}>
              Dashboard
            </NavItem>
            <NavItem href="/profile" pathname={pathname}>
              Profile
            </NavItem>
            <NavItem href="/resources" pathname={pathname}>
              Resources
            </NavItem>
            <NavItem href="/coding-challenges" pathname={pathname}>
              Coding Challenges
            </NavItem>
            <NavItem href="/career-roadmap" pathname={pathname}>
              Career Roadmap
            </NavItem>
            <NavItem href="/placement-preparation" pathname={pathname}>
              Placement Prep
            </NavItem>
            <NavItem href="/community" pathname={pathname}>
              Community
            </NavItem>
            <button
              onClick={toggleTheme}
              className="text-gray-100 hover:text-gray-300 focus:outline-none"
            >
              {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="text-gray-100 hover:text-gray-300 focus:outline-none"
              >
                <FiUser size={20} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                  <Link
                    href="/profile"
                    onClick={handleLinkClick}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/logout"
                    onClick={handleLinkClick}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                  >
                    Logout
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-100 hover:text-gray-300 focus:outline-none"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavItem
              href="/dashboard"
              pathname={pathname}
              onClick={handleLinkClick}
            >
              Dashboard
            </NavItem>
            <NavItem
              href="/profile"
              pathname={pathname}
              onClick={handleLinkClick}
            >
              Profile
            </NavItem>
            <NavItem
              href="/resources"
              pathname={pathname}
              onClick={handleLinkClick}
            >
              Resources
            </NavItem>
            <NavItem
              href="/coding-challenges"
              pathname={pathname}
              onClick={handleLinkClick}
            >
              Coding Challenges
            </NavItem>
            <NavItem
              href="/career-roadmap"
              pathname={pathname}
              onClick={handleLinkClick}
            >
              Career Roadmap
            </NavItem>
            <NavItem
              href="/placement-preparation"
              pathname={pathname}
              onClick={handleLinkClick}
            >
              Placement Prep
            </NavItem>
            <NavItem
              href="/community"
              pathname={pathname}
              onClick={handleLinkClick}
            >
              Community
            </NavItem>
            <button
              onClick={toggleTheme}
              className="w-full text-left px-4 py-2 text-gray-100 hover:bg-gray-100 focus:outline-none rounded-md"
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="w-full text-left px-4 py-2 text-gray-100 hover:bg-gray-100 focus:outline-none rounded-md"
              >
                <FiUser size={20} className="inline-block" /> User Name
              </button>
              <div
                className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 ${!dropdownOpen && "hidden"
                  }`}
              >
                <Link
                  href="/profile"
                  onClick={handleLinkClick}
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  Profile
                </Link>
                <Link
                  href="/logout"
                  onClick={handleLinkClick}
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  Logout
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavItem = ({ href, pathname, onClick, children }) => (
  <Link
    href={href}
    onClick={onClick}
    className={`block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-600 ${pathname === href ? "text-blue-500 font-semibold" : ""
      }`}
  >
    {children}
  </Link>
);

export default Navbar;
