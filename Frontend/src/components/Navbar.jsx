"use client";
import React, { useContext, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import { UserContext } from '../context/UserContext';

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const { user, authenticated } = useContext(UserContext);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  console.log(authenticated);

  const handleLinkClick = (e, href) => {

    setIsOpen(false);

  };

  return (
    <div className="bg-primary-800 p-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-light text-xl font-bold">
          Mr. Engineers
        </Link>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-light">
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
      <div
        className={`${isOpen ? "block" : "hidden"
          } mt-4 md:flex md:flex-row md:space-x-4`}
      >
        <Link
          onClick={handleLinkClick}
          href="/dashboard"
          className={`block md:inline-block text-gray-300 hover:text-light px-3 py-2 ${pathname === "/dashboard"
            ? "border-b-2 border-light text-light"
            : ""
            }`}

        >
          Dashboard
        </Link>
        <Link
          href="/profile"
          className={`block md:inline-block text-gray-300 hover:text-light px-3 py-2 ${pathname === "/profile" ? "border-b-2 border-light text-light" : ""
            }`}
          onClick={handleLinkClick}
        >
          Profile
        </Link>
        <Link
          href="/resources"
          className={`block md:inline-block text-gray-300 hover:text-light px-3 py-2 ${pathname === "/resources"
            ? "border-b-2 border-light text-light"
            : ""
            }`}
          onClick={handleLinkClick}
        >
          Resources
        </Link>
        <Link
          href="/coding-challenges"
          className={`block md:inline-block text-gray-300 hover:text-light px-3 py-2 ${pathname === "/coding-challenges"
            ? "border-b-2 border-light text-light"
            : ""
            }`}
          onClick={handleLinkClick}
        >
          Coding Challenges
        </Link>
        <Link
          href="/career-roadmap"
          className={`block md:inline-block text-gray-300 hover:text-light px-3 py-2 ${pathname === "/career-roadmap"
            ? "border-b-2 border-light text-light"
            : ""
            }`}
          onClick={handleLinkClick}
        >
          Career Roadmap
        </Link>
        <Link
          href="/placement-preparation"
          className={`block md:inline-block text-gray-300 hover:text-light px-3 py-2 ${pathname === "/placement-preparation"
            ? "border-b-2 border-light text-light"
            : ""
            }`}
          onClick={handleLinkClick}
        >
          Placement Preparation
        </Link>
        <Link
          href="/community"
          className={`block md:inline-block text-gray-300 hover:text-light px-3 py-2 ${pathname === "/community"
            ? "border-b-2 border-light text-light"
            : ""
            }`}
          onClick={handleLinkClick}
        >
          Community
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
