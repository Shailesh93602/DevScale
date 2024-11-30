"use client";
import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiSun, FiMoon } from "react-icons/fi";
import { FaAngleDown, FaRegUserCircle } from "react-icons/fa";
import { PiSignOutFill } from "react-icons/pi";
import { GrAchievement, GrArticle } from "react-icons/gr";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { fetchData } from "@/app/services/fetchData";
import { useDispatch, useSelector } from "react-redux";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState(useSelector((state) => state.user?.user));

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    setDropdownOpen(!dropdownOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="bg-gray-50 border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900 shadow-lg w-full z-50 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Mr.Eng
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <NavItem href="/dashboard" pathname={pathname}>
              Dashboard
            </NavItem>

            <NavItem href="/battle-zone" pathname={pathname}>
              Battle Zone
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
              className=" hover:text-gray-900 dark:hover:text-gray-300 focus:outline-none"
            >
              {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="text-gray-100 hover:text-gray-300 focus:outline-none"
              >
                <Avatar className="font-semibold text-3xl items-center justify-center">
                  <AvatarImage src={user?.profilePicture} alt="S" />
                  <AvatarFallback className="bg-red">
                    {user?.username?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg py-1">
                  <Link
                    href="/profile"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md"
                  >
                    <FaRegUserCircle />
                    Profile
                  </Link>
                  <Link
                    href="/achievements"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md"
                  >
                    <GrAchievement />
                    Achievements
                  </Link>
                  <Link
                    href="/articles"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md"
                  >
                    <GrArticle />
                    My Articles
                  </Link>
                  <Link
                    href="/logout"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md"
                  >
                    <PiSignOutFill />
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
              href="/battle-zone"
              pathname={pathname}
              onClick={handleLinkClick}
            >
              Battle Zone
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
                <Avatar className="font-semibold text-3xl items-center justify-center">
                  <AvatarImage src={user?.profilePicture} alt="S" />
                  <AvatarFallback className="bg-red">
                    {user?.username?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
              <div
                className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 ${
                  !dropdownOpen && "hidden"
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
    className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
      pathname === href ? "text-blue-500 font-semibold" : ""
    }`}
  >
    {children}
  </Link>
);

export default Navbar;
