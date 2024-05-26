"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();

  return (
    <div className="bg-gray-800 p-4">
      <div className="flex items-center">
        <Link href="/" className="text-white text-xl font-bold">Mr. Engineers</Link>
      </div>
      <div className="flex mt-4">
        <div className="flex space-x-4">
          <Link href="/dashboard" className={`text-gray-300 hover:text-white px-3 py-2 ${router.pathname === '/dashboard' ? 'border-b-2 border-white text-white' : ''}`}>Dashboard</Link>
          <Link href="/profile" className={`text-gray-300 hover:text-white px-3 py-2 ${router.pathname === '/profile' ? 'border-b-2 border-white text-white' : ''}`}>Profile
          </Link>
          <Link href="/resources" className={`text-gray-300 hover:text-white px-3 py-2 ${router.pathname === '/resources' ? 'border-b-2 border-white text-white' : ''}`}>Resources
          </Link>
          <Link href="/coding-challenges" className={`text-gray-300 hover:text-white px-3 py-2 ${router.pathname === '/coding-challenges' ? 'border-b-2 border-white text-white' : ''}`}>Coding Challenges
          </Link>
          <Link href="/career-roadmap" className={`text-gray-300 hover:text-white px-3 py-2 ${router.pathname === '/career-roadmap' ? 'border-b-2 border-white text-white' : ''}`}>Career Roadmap
          </Link>
          <Link href="/placement-preparation" className={`text-gray-300 hover:text-white px-3 py-2 ${router.pathname === '/placement-preparation' ? 'border-b-2 border-white text-white' : ''}`}>Placement Preparation
          </Link>
          <Link href="/community" className={`text-gray-300 hover:text-white px-3 py-2 ${router.pathname === '/community' ? 'border-b-2 border-white text-white' : ''}`}>Community
          </Link>
          <Link href="/faq" className={`text-gray-300 hover:text-white px-3 py-2 ${router.pathname === '/faq' ? 'border-b-2 border-white text-white' : ''}`}>FAQ
          </Link>
          <Link href="/about-us" className={`text-gray-300 hover:text-white px-3 py-2 ${router.pathname === '/about-us' ? 'border-b-2 border-white text-white' : ''}`}>About Us
          </Link>
          <Link href="/contact-us" className={`text-gray-300 hover:text-white px-3 py-2 ${router.pathname === '/contact-us' ? 'border-b-2 border-white text-white' : ''}`}>Contact Us
          </Link>
          <Link href="/blogs" className={`text-gray-300 hover:text-white px-3 py-2 ${router.pathname === '/blogs' ? 'border-b-2 border-white text-white' : ''}`}>Blogs
          </Link>
          <Link href="/discussion-forums" className={`text-gray-300 hover:text-white px-3 py-2 ${router.pathname === '/discussion-forums' ? 'border-b-2 border-white text-white' : ''}`}>Discussion Forums
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
