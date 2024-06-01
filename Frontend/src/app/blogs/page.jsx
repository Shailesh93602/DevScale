"use client";
import Link from 'next/link';

const blogs = [
  {
    id: 1,
    title: "Understanding JavaScript Closures",
    description: "A deep dive into closures in JavaScript and how to use them effectively.",
    link: "/blogs/js-closures"
  },
  {
    id: 2,
    title: "A Guide to Responsive Web Design",
    description: "Learn how to make your websites look great on all devices with responsive design techniques.",
    link: "/blogs/responsive-web-design"
  },
  {
    id: 3,
    title: "Top 10 CSS Tricks for Beginners",
    description: "Improve your CSS skills with these 10 essential tricks every beginner should know.",
    link: "/blogs/css-tricks"
  },
];

export default function Blogs() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Blogs</h1>
        <p className="text-gray-600 text-lg mb-6">
          Discover our latest blog posts, tutorials, and resources to help you on your learning journey.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-light rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{blog.title}</h2>
              <p className="text-gray-600 mb-4">{blog.description}</p>
              <Link href={blog.link} className="text-indigo-500 font-semibold hover:underline">Read more</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
