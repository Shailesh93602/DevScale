"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  return (
    <footer className="bg-blue-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between">
          <Link
            href="/faq"
            className={`text-gray-300 hover:text-light px-3 py-2 min-w-max ${
              pathname === "/faq" ? "border-b-2 border-light text-light" : ""
            }`}
          >
            FAQ
          </Link>
          <Link
            href="/about-us"
            className={`text-gray-300 hover:text-light px-3 py-2 min-w-max ${
              pathname === "/about-us"
                ? "border-b-2 border-light text-light"
                : ""
            }`}
          >
            About Us
          </Link>
          <Link
            href="/contact-us"
            className={`text-gray-300 hover:text-light px-3 py-2 min-w-max ${
              pathname === "/contact-us"
                ? "border-b-2 border-light text-light"
                : ""
            }`}
          >
            Contact Us
          </Link>
          <Link
            href="/blogs"
            className={`text-gray-300 hover:text-light px-3 py-2 min-w-max ${
              pathname === "/blogs" ? "border-b-2 border-light text-light" : ""
            }`}
          >
            Blogs
          </Link>
          <Link
            href="/discussion-forums"
            className={`text-gray-300 hover:text-light px-3 py-2 min-w-max ${
              pathname === "/discussion-forums"
                ? "border-b-2 border-light text-light"
                : ""
            }`}
          >
            Discussion Forums
          </Link>
        </div>
        <p className="text-center mt-4">@Mr. Engineers, All rights reserved</p>
      </div>
    </footer>
  );
}
