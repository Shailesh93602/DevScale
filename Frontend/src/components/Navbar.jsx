"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = ({path}) => {
  const pathname = usePathname();
  return (
    <div className="bg-primary-800 p-4">
      <div className="flex items-center">
        <Link href="/" className="text-light text-xl font-bold">Mr. Engineers</Link>
      </div>
      <div className="flex mt-4">
        <div className="flex space-x-4">
          <Link href="/dashboard" className={`text-gray-300 hover:text-light px-3 py-2 ${pathname === '/dashboard' ? 'border-b-2 border-light text-light' : ''}`}>Dashboard</Link>
          <Link href="/profile" className={`text-gray-300 hover:text-light px-3 py-2 ${pathname === '/profile' ? 'border-b-2 border-light text-light' : ''}`}>Profile
          </Link>
          <Link href="/resources" className={`text-gray-300 hover:text-light px-3 py-2 ${pathname === '/resources' ? 'border-b-2 border-light text-light' : ''}`}>Resources
          </Link>
          <Link href="/coding-challenges" className={`text-gray-300 hover:text-light px-3 py-2 ${pathname === '/coding-challenges' ? 'border-b-2 border-light text-light' : ''}`}>Coding Challenges
          </Link>
          <Link href="/career-roadmap" className={`text-gray-300 hover:text-light px-3 py-2 ${pathname === '/career-roadmap' ? 'border-b-2 border-light text-light' : ''}`}>Career Roadmap
          </Link>
          <Link href="/placement-preparation" className={`text-gray-300 hover:text-light px-3 py-2 ${pathname === '/placement-preparation' ? 'border-b-2 border-light text-light' : ''}`}>Placement Preparation
          </Link>
          <Link href="/community" className={`text-gray-300 hover:text-light px-3 py-2 ${pathname === '/community' ? 'border-b-2 border-light text-light' : ''}`}>Community
          </Link>
          <Link href="/faq" className={`text-gray-300 hover:text-light px-3 py-2 ${pathname === '/faq' ? 'border-b-2 border-light text-light' : ''}`}>FAQ
          </Link>
          <Link href="/about-us" className={`text-gray-300 hover:text-light px-3 py-2 ${pathname === '/about-us' ? 'border-b-2 border-light text-light' : ''}`}>About Us
          </Link>
          <Link href="/contact-us" className={`text-gray-300 hover:text-light px-3 py-2 ${pathname === '/contact-us' ? 'border-b-2 border-light text-light' : ''}`}>Contact Us
          </Link>
          <Link href="/blogs" className={`text-gray-300 hover:text-light px-3 py-2 ${pathname === '/blogs' ? 'border-b-2 border-light text-light' : ''}`}>Blogs
          </Link>
          <Link href="/discussion-forums" className={`text-gray-300 hover:text-light px-3 py-2 ${pathname === '/discussion-forums' ? 'border-b-2 border-light text-light' : ''}`}>Discussion Forums
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
