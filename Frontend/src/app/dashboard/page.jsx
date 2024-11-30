"use client";
import React, { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";
import CourseCard from "@/components/CourseCard";
import Section from "@/components/Section";
import { useSelector } from "react-redux";

export default function Dashboard() {
  const user = useSelector((state) => state.user?.user);
  const [username, setUsername] = useState(user.username);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold">Welcome,</h1>
            <h2 className="text-5xl font-extrabold text-primary">
              {username &&
                username.charAt(0).toUpperCase() +
                  username.slice(
                    1,
                    username.indexOf(" ") == -1
                      ? username.length
                      : username.indexOf(" ") + 1
                  )}
            </h2>
          </div>
        </header>

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
            color="blue"
          />
        </div>

        <Section title="Continue Previous:">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <CourseCard
              title="Dynamic Programming"
              description="Detailed Explanation of"
              thumbnail="/images/dp.jpeg"
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

const courses = [
  {
    id: 1,
    thumbnail: "/images/dsa.jpeg",
    title: "Data Structures and Algorithms",
    description: "LeetCode's Interview Crash Course",
    chapters: 13,
    items: 149,
    completed: 0,
  },
  {
    id: 2,
    thumbnail: "/images/sd.jpeg",
    title: "System Design for Interviews and Beyond",
    description: "LeetCode's Interview Crash Course",
    chapters: 16,
    items: 81,
    completed: 25,
  },
  {
    id: 4,
    thumbnail: "/images/interview.jpeg",
    title: "Top Interview Questions",
    description: "Easy Collection",
    chapters: 9,
    items: 48,
    completed: 50,
  },
  {
    id: 5,
    thumbnail: "/images/dp.jpeg",
    title: "Dynamic Programming",
    description: "Detailed Explanation of",
    chapters: 6,
    items: 55,
    completed: 75,
  },
  {
    id: 6,
    thumbnail: "/images/array.png",
    title: "Arrays 101",
    description: "Introduction to Data Structure",
    chapters: 6,
    items: 31,
    completed: 90,
  },
  {
    id: 7,
    thumbnail: "/images/google_interview.png",
    title: "Google Interview",
    description: "Get Well Prepared for",
    chapters: 9,
    items: 85,
    completed: 100,
  },
];
