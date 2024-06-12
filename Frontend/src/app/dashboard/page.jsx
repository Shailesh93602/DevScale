"use client";
import React, { useContext, useEffect, useState } from "react";
import { FiPlayCircle } from "react-icons/fi";
import { UserContext } from "../../context/UserContext";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [username, setUsername] = useState("Loading...");
  const { authenticated, user } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (!authenticated) {
      router.push("/u/login");
    } else {
      setUsername(user.fullName?.split(" ")[0]);
    }
  }, [authenticated, router, user]);

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-2 text-gray-900">Welcome,</h1>
        <h2 className="text-5xl font-extrabold mb-8 text-indigo-700">
          {username}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <StatCard
            title="Progress Overview"
            content="You've completed 40% of your roadmap."
            progress={40}
            color="blue"
          />
          <StatCard
            title="Upcoming Events"
            content={
              <ul>
                <li>- JavaScript Quiz on June 10</li>
                <li>- HTML Webinar on June 12</li>
              </ul>
            }
            color="green"
          />
          <StatCard
            title="Recent Achievements"
            content={
              <ul>
                <li>- Completed "JavaScript Basics" course</li>
                <li>- Scored 95% on "HTML Quiz"</li>
              </ul>
            }
            color="purple"
          />
        </div>

        <Section title="Continue Previous:">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <CourseCard
              title="Dynamic Programming"
              description="Detailed Explanation of"
              thumbnail="https://placehold.co/200x100"
              chapters={6}
              items={55}
              completed={7}
            />
          </div>
        </Section>

        <Section title="Featured">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {courses.map((course) => (
              <CourseCard
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
        </Section>
      </div>
    </div>
  );
}

const StatCard = ({ title, content, progress, color }) => (
  <div
    className={`p-6 bg-${color}-500 text-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105`}
  >
    <h3 className="text-xl font-semibold">{title}</h3>
    <div className="mt-2">{content}</div>
    {progress && (
      <div className="mt-4">
        <div className="h-2 bg-gray-300 rounded-full">
          <div
            className={`h-full bg-${color}-700 rounded-full`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    )}
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-12">
    <h3 className="text-3xl font-bold mb-6 text-gray-900">{title}</h3>
    {children}
  </div>
);

const CourseCard = ({
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
