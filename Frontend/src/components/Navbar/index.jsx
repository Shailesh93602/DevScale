"use client";
import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiSun, FiMoon } from "react-icons/fi";
import { FaRegUserCircle } from "react-icons/fa";
import { PiSignOutFill } from "react-icons/pi";
import { GrAchievement, GrArticle } from "react-icons/gr";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSelector } from "react-redux";

const navItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
  },
  {
    path: "/battle-zone",
    label: "Battle Zone",
  },
  {
    path: "/resources",
    label: "Resources",
  },
  {
    path: "/coding-challenges",
    label: "Coding Challenges",
  },
  {
    path: "/career-roadmap",
    label: "Career Roadmap",
  },
  {
    path: "/placement-preparation",
    label: "Placement Preparation",
  },
  {
    path: "/community",
    label: "Community",
  },
];

const profileItems = [
  {
    path: "/profile",
    label: "Profile",
    icon: <FaRegUserCircle />,
  },
  {
    path: "/achievements",
    label: "Achievements",
    icon: <GrAchievement />,
  },
  {
    path: "/articles",
    label: "My Articles",
    icon: <GrArticle />,
  },
  {
    path: "/logout",
    label: "Logout",
    icon: <PiSignOutFill />,
  },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const user = useSelector((state) => state.user?.user);

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
            <Link
              href="/"
              className="text-xl font-bold text-primary hover:text-primary2"
            >
              Mr.Eng
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item, index) => (
              <NavItem
                key={index}
                href={item.path}
                activeClassName="text-blue-500 font-bold"
              >
                {item.label}
              </NavItem>
            ))}
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
                  {profileItems.map((profileItem, index) => (
                    <Link
                      href={profileItem.path}
                      onClick={handleLinkClick}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-light rounded-md"
                    >
                      {profileItem.icon}
                      {profileItem.label}
                    </Link>
                  ))}
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
            {navItems.map((navItem, index) => (
              <NavItem
                key={index}
                href={navItem.path}
                handleClick={handleLinkClick}
              >
                {navItem.label}
              </NavItem>
            ))}
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
                className={`absolute right-0 mt-2 w-48 bg-lightSecondary border border-border rounded-md shadow-lg py-1 ${
                  !dropdownOpen && "hidden"
                }`}
              >
                {profileItems.map((profileItem, index) => (
                  <Link
                    key={index}
                    href={profileItem.path}
                    onClick={handleLinkClick}
                    className="block px-4 py-2 rounded-md"
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

const NavItem = ({ href, children, handleClick }) => {
  const pathname = usePathname();

  const isActive = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium hover:text-primary2 hover:underline ${
        isActive ? "text-primary font-semibold" : ""
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar;
