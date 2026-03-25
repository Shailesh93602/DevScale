'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const DiscussionForum = () => {
  const router = useRouter();

  const forumTopics = [
    { id: '1', title: 'Introduction to Mechanical Engineering', replies: 25 },
    { id: '2', title: 'Software Development Best Practices', replies: 32 },
    { id: '3', title: 'Electrical Circuit Design Techniques', replies: 18 },
  ];

  const goToTopic = (topicId: string) => {
    router.push(`/discussion-forums/${topicId}`);
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="mb-6 text-3xl font-bold">Discussion Forums</h1>
      <div className="grid grid-cols-1 gap-6 text-dark md:grid-cols-2 lg:grid-cols-3">
        {forumTopics.map((topic) => (
          <div
            key={topic.id}
            className="cursor-pointer rounded-md bg-light p-6 shadow-md transition duration-300 hover:bg-gray-100"
            onClick={() => goToTopic(topic.id)}
          >
            <h2 className="mb-2 text-xl font-semibold">{topic.title}</h2>
            <p className="text-gray-600">Replies: {topic.replies}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscussionForum;
