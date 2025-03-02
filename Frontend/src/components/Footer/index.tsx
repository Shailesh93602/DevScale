'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  return (
    <footer className="z-50 w-full border-t border-border bg-lightSecondary text-gray-900 shadow-lg dark:text-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between">
          <Link
            href="/faq"
            className={`min-w-max px-3 py-2 ${
              pathname === '/faq' ? 'border-b-2 border-light text-light' : ''
            }`}
          >
            FAQ
          </Link>
          <Link
            href="/about-us"
            className={`min-w-max px-3 py-2 ${
              pathname === '/about-us'
                ? 'border-b-2 border-light text-light'
                : ''
            }`}
          >
            About Us
          </Link>
          <Link
            href="/contact-us"
            className={`min-w-max px-3 py-2 ${
              pathname === '/contact-us'
                ? 'border-b-2 border-light text-light'
                : ''
            }`}
          >
            Contact Us
          </Link>
          <Link
            href="/blogs"
            className={`min-w-max px-3 py-2 ${
              pathname === '/blogs' ? 'border-b-2 border-light text-light' : ''
            }`}
          >
            Blogs
          </Link>
          <Link
            href="/discussion-forums"
            className={`min-w-max px-3 py-2 ${
              pathname === '/discussion-forums'
                ? 'border-b-2 border-light text-light'
                : ''
            }`}
          >
            Discussion Forums
          </Link>
        </div>
        <p className="mt-4 text-center">@Mr. Engineers, All rights reserved</p>
      </div>
    </footer>
  );
}
