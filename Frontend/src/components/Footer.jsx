"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  return (
    <>
      <div className="">
        <div className="flex max-w-full flex-wrap">
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
        <p>@Mr. Engineers, All rights reserved</p>
      </div>
    </>
  );
}
