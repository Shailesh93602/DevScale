const blogPosts = {
  'js-closures': {
    title: 'Understanding JavaScript Closures',
    content:
      'A deep dive into closures in JavaScript and how to use them effectively...',
  },
  'responsive-web-design': {
    title: 'A Guide to Responsive Web Design',
    content:
      'Learn how to make your websites look great on all devices with responsive design techniques...',
  },
  'css-tricks': {
    title: 'Top 10 CSS Tricks for Beginners',
    content:
      'Improve your CSS skills with these 10 essential tricks every beginner should know...',
  },
};

export default async function BlogPost({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;
  const blog: { title: string; content: string } =
    blogPosts[id as keyof object];

  if (!blog) {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="mb-6 text-4xl font-bold text-gray-900">{blog.title}</h1>
        <div className="rounded-lg bg-light p-6 shadow">
          <p className="text-gray-600">{blog.content}</p>
        </div>
      </div>
    </div>
  );
}
