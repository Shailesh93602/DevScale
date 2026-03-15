'use client';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

const blogs = [
  {
    id: 1,
    title: 'Understanding JavaScript Closures',
    description:
      'A deep dive into closures in JavaScript and how to use them effectively.',
    link: '/blogs/js-closures',
    category: 'JavaScript',
  },
  {
    id: 2,
    title: 'A Guide to Responsive Web Design',
    description:
      'Learn how to make your websites look great on all devices with responsive design techniques.',
    link: '/blogs/responsive-web-design',
    category: 'CSS',
  },
  {
    id: 3,
    title: 'Top 10 CSS Tricks for Beginners',
    description:
      'Improve your CSS skills with these 10 essential tricks every beginner should know.',
    link: '/blogs/css-tricks',
    category: 'CSS',
  },
];

export default function Blogs() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Blogs</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Discover our latest blog posts, tutorials, and resources to help you
            on your learning journey.
          </p>
        </div>

        {blogs.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No blog posts yet"
            description="Blog posts will appear here once they are published. Check back soon!"
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={blog.link}
                className="hover:border-primary/30 group rounded-lg border border-border bg-card p-6 no-underline shadow-sm transition-all hover:shadow-md"
              >
                <span className="bg-primary/10 mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-primary">
                  {blog.category}
                </span>
                <h2 className="mb-2 text-xl font-bold text-foreground">
                  {blog.title}
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  {blog.description}
                </p>
                <span className="inline-flex items-center text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
