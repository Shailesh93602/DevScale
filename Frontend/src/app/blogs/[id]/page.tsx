import { notFound } from 'next/navigation';

// Blog posts are not implemented yet.
//
// This module used to hold three hardcoded stub posts and, for any id that
// wasn't one of them, rendered a permanent "Loading..." — a page that never
// loads and never errors. Until posts come from real data, an unknown post is
// a 404, which is both honest and what Next's not-found handling expects.
const blogPosts: Record<string, { title: string; content: string }> = {};

export default async function BlogPost({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;
  const blog = id ? blogPosts[id] : undefined;

  if (!blog) notFound();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="mb-6 text-4xl font-bold text-foreground">
          {blog.title}
        </h1>
        <div className="rounded-lg bg-card p-6 shadow">
          <p className="text-muted-foreground">{blog.content}</p>
        </div>
      </div>
    </div>
  );
}
