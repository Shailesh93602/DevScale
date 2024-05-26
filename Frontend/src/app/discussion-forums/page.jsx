"use client";
import React from "react";
import { useRouter } from "next/navigation";

const DiscussionForum = () => {
  const router = useRouter();

  const forumTopics = [
    { id: 1, title: "Introduction to Mechanical Engineering", replies: 25 },
    { id: 2, title: "Software Development Best Practices", replies: 32 },
    { id: 3, title: "Electrical Circuit Design Techniques", replies: 18 },
  ];

  const goToTopic = (topicId) => {
    router.push(`/forums/${topicId}`); 
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Discussion Forums</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-black">
        {forumTopics.map((topic) => (
          <div
            key={topic.id}
            className="p-6 bg-white shadow-md rounded-md cursor-pointer hover:bg-gray-100 transition duration-300"
            onClick={() => goToTopic(topic.id)}
          >
            <h2 className="text-xl font-semibold mb-2">{topic.title}</h2>
            <p className="text-gray-600">Replies: {topic.replies}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscussionForum;
