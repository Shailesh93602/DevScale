import React from "react";
import Link from "next/link";
import { FiPlayCircle } from "react-icons/fi";

export default function Home() {
  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-2 text-gray-900">Welcome,</h1>
        <h2 className="text-5xl font-extrabold mb-8 text-indigo-700">
          Shailesh Chaudhari
        </h2>

        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">
            Continue Previous:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <Card
              title="Dynamic Programming"
              description="Detailed Explanation of"
              thumbnail="https://placehold.co/200x100"
              chapters={6}
              items={55}
              completed={7}
            />
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold mb-6 text-gray-900">Featured</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {courses.map((course) => (
              <Card
                key={course.id}
                title={course.title}
                description={course.description}
                thumbnail={course.thumbnail}
                chapters={course.chapters}
                items={course.items}
                completed={course.completed}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const Card = ({
  title,
  description,
  thumbnail,
  chapters,
  items,
  completed,
}) => (
  <div className="relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
    <img
      src={thumbnail}
      alt="Course Thumbnail"
      className="rounded-lg w-full mb-4 object-cover"
    />
    <div className="space-y-2">
      <h4 className="text-xl font-bold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
      <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg">
        <FiPlayCircle size={24} />
      </div>
      <ProgressCircle completed={completed} />
    </div>
    <div className="mt-4 flex items-center text-gray-700">
      <span className="mr-4">{chapters} Chapters</span>
      <span>{items} Items</span>
    </div>
    <div className="mt-1 text-xs text-gray-500">{completed}% Completed</div>
  </div>
);

const ProgressCircle = ({ completed }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completed / 100) * circumference;

  return (
    <div className="relative mt-4 w-16 h-16">
      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
        <circle
          className="text-gray-300"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
        <circle
          className="text-indigo-600"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
        {completed}%
      </div>
    </div>
  );
};

const courses = [
  {
    id: 1,
    thumbnail: "https://placehold.co/200x100",
    title: "Data Structures and Algorithms",
    description: "LeetCode's Interview Crash Course",
    chapters: 13,
    items: 149,
    completed: 0,
  },
  {
    id: 2,
    thumbnail: "https://placehold.co/200x100",
    title: "System Design for Interviews and Beyond",
    description: "LeetCode's Interview Crash Course",
    chapters: 16,
    items: 81,
    completed: 25,
  },
  {
    id: 3,
    thumbnail: "https://placehold.co/200x100",
    title: "The LeetCode Beginner's Guide",
    description: "",
    chapters: 4,
    items: 17,
    completed: 30,
  },
  {
    id: 4,
    thumbnail: "https://placehold.co/200x100",
    title: "Top Interview Questions",
    description: "Easy Collection",
    chapters: 9,
    items: 48,
    completed: 50,
  },
  {
    id: 5,
    thumbnail: "https://placehold.co/200x100",
    title: "Dynamic Programming",
    description: "Detailed Explanation of",
    chapters: 6,
    items: 55,
    completed: 75,
  },
  {
    id: 6,
    thumbnail: "https://placehold.co/200x100",
    title: "Arrays 101",
    description: "Introduction to Data Structure",
    chapters: 6,
    items: 31,
    completed: 90,
  },
  {
    id: 7,
    thumbnail: "https://placehold.co/200x100",
    title: "Google Interview",
    description: "Get Well Prepared for",
    chapters: 9,
    items: 85,
    completed: 100,
  },
];
