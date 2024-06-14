"use client";
import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiSun, FiMoon, FiUser } from "react-icons/fi";
import { UserContext } from "../context/UserContext";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  const { user, authenticated } = useContext(UserContext);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setTheme(savedTheme);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-white text-2xl font-bold">
          Mr. Engineers
        </Link>
        <div className="flex items-center">
          <button onClick={toggleTheme} className="text-white mr-4">
            {theme === "light" ? <FiMoon size={24} /> : <FiSun size={24} />}
          </button>
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white">
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } mt-4 md:flex md:flex-row md:space-x-4`}
      >
        <NavItem
          href="/dashboard"
          pathname={pathname}
          onClick={handleLinkClick}
        >
          Dashboard
        </NavItem>
        <NavItem href="/profile" pathname={pathname} onClick={handleLinkClick}>
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
          Placement Preparation
        </NavItem>
        <NavItem
          href="/community"
          pathname={pathname}
          onClick={handleLinkClick}
        >
          Community
        </NavItem>
        {authenticated && (
          <div className="relative">
            <button className="text-white flex items-center">
              <FiUser size={24} />
              <span className="ml-2">{user?.fullName?.split(" ")[0]}</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
              <Link
                href="/profile"
                onClick={handleLinkClick}
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                Profile
              </Link>
              <Link
                href="/logout"
                onClick={handleLinkClick}
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                Logout
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavItem = ({ href, pathname, onClick, children }) => (
  <Link
    href={href}
    className={`block md:inline-block text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md transition ${
      pathname === href ? "bg-white bg-opacity-20" : ""
    }`}
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navbar;
