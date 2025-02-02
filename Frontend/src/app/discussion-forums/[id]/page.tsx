const forumTopics = [
  { id: '1', title: 'Introduction to Mechanical Engineering', replies: 25 },
  { id: '2', title: 'Software Development Best Practices', replies: 32 },
  { id: '3', title: 'Electrical Circuit Design Techniques', replies: 18 },
];
export default async function ViewChallengePage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;
  const topic = forumTopics.find((topic) => topic.id === id);

  if (!topic) {
    return <div className="container mx-auto p-4">Topic not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="rounded-lg bg-light p-6 shadow-md">
        <div
          key={topic.id}
          className="cursor-pointer rounded-md bg-light p-6 text-dark shadow-md transition duration-300 hover:bg-gray-100"
        >
          <h2 className="mb-2 text-xl font-semibold">{topic.title}</h2>
          <p className="text-gray-600">Replies: {topic.replies}</p>
        </div>
      </div>
    </div>
  );
}
