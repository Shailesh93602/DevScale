'use client';
import React, { useState } from 'react';
import CourseCard from '@/components/CourseCard';
import Section from '@/components/Section';
import { useSelector } from 'react-redux';
import ProgressWidget from '@/components/ProgressWidget';
import { Clock, CheckCircle, Star, BookOpen } from 'lucide-react';
import { EnrolledRoadmap, FeaturedRoadmap } from './types';

export default function Dashboard() {
  const user = useSelector(
    (state: { user: { user: { username: string } } }) => state.user?.user,
  );
  const [username] = useState(user?.username);

  // Sample data for enrolled roadmaps
  const enrolledRoadmaps: EnrolledRoadmap[] = [
    {
      id: '1',
      title: 'Full Stack Web Development',
      author: 'Tech Academy',
      progress: 65,
      lastAccessed: '2 days ago',
      topics: 42,
      completed: 27,
    },
    {
      id: '2',
      title: 'Machine Learning Fundamentals',
      author: 'AI Research Group',
      progress: 30,
      lastAccessed: 'Yesterday',
      topics: 36,
      completed: 11,
    },
  ];

  // Sample data for featured roadmaps
  const featuredRoadmaps: FeaturedRoadmap[] = [
    {
      id: '4',
      title: 'Cybersecurity Essentials',
      author: 'Security Pros',
      enrollments: 2456,
      rating: 4.8,
      topics: 38,
    },
    {
      id: '5',
      title: 'Data Science for Engineers',
      author: 'Data Analysis Group',
      enrollments: 1872,
      rating: 4.7,
      topics: 45,
    },
  ];

  // Calculate stats
  const stats = {
    enrolledCount: enrolledRoadmaps.length,
    completedTopics: enrolledRoadmaps.reduce((sum, r) => sum + r.completed, 0),
    averageProgress: Math.round(
      enrolledRoadmaps.reduce((sum, r) => sum + r.progress, 0) /
        enrolledRoadmaps.length,
    ),
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold">Welcome,</h1>
            <h2 className="text-5xl font-extrabold text-primary">
              {username &&
                username.charAt(0).toUpperCase() +
                  username.slice(
                    1,
                    username.indexOf(' ') == -1
                      ? username.length
                      : username.indexOf(' ') + 1,
                  )}
            </h2>
          </div>
        </header>

        {/* Progress Stats */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-6">
            <div className="font-medium text-blue-600">Enrolled Roadmaps</div>
            <div className="mt-2 text-3xl font-bold">{stats.enrolledCount}</div>
          </div>
          <div className="rounded-lg bg-green-50 p-6">
            <div className="font-medium text-green-600">Topics Completed</div>
            <div className="mt-2 text-3xl font-bold">
              {stats.completedTopics}
            </div>
          </div>
          <div className="rounded-lg bg-purple-50 p-6">
            <div className="font-medium text-purple-600">Average Progress</div>
            <div className="mt-2 text-3xl font-bold">
              {stats.averageProgress}%
            </div>
          </div>
        </div>

        {/* Progress Widget */}
        <ProgressWidget
          initialData={{
            chapters: enrolledRoadmaps.reduce((sum, r) => sum + r.topics, 0),
            items: 100,
            completedChapters: enrolledRoadmaps.reduce(
              (sum, r) => sum + r.completed,
              0,
            ),
            completedItems: 25,
          }}
        />

        {/* Enrolled Roadmaps */}
        <Section title="Your Enrolled Roadmaps">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledRoadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {roadmap.title}
                    </h3>
                    <p className="text-sm text-gray-600">By {roadmap.author}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{roadmap.lastAccessed}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      <span>
                        {roadmap.completed}/{roadmap.topics} topics
                      </span>
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="flex items-center">
                      <div className="mr-2 flex-1">
                        <div className="h-2 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{ width: `${roadmap.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {roadmap.progress}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Featured Roadmaps */}
        <Section title="Featured Roadmaps">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredRoadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {roadmap.title}
                    </h3>
                    <p className="text-sm text-gray-600">By {roadmap.author}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center text-amber-500">
                        <Star className="mr-1 h-4 w-4 fill-current" />
                        <span>{roadmap.rating}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <BookOpen className="mr-1 h-4 w-4" />
                        <span>{roadmap.topics} topics</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {roadmap.enrollments.toLocaleString()} enrolled
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Featured Courses */}
        <Section title="Featured Courses">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
    thumbnail: '/images/DSA.png',
    title: 'Data Structures and Algorithms',
    description: "LeetCode's Interview Crash Course",
    chapters: 13,
    items: 149,
    completed: 0,
  },
  {
    id: 2,
    thumbnail: '/images/sd.jpeg',
    title: 'System Design for Interviews and Beyond',
    description: "LeetCode's Interview Crash Course",
    chapters: 16,
    items: 81,
    completed: 25,
  },
  {
    id: 4,
    thumbnail: '/images/interview.jpeg',
    title: 'Top Interview Questions',
    description: 'Easy Collection',
    chapters: 9,
    items: 48,
    completed: 50,
  },
  {
    id: 5,
    thumbnail: '/images/dp.jpeg',
    title: 'Dynamic Programming',
    description: 'Detailed Explanation of',
    chapters: 6,
    items: 55,
    completed: 75,
  },
  {
    id: 6,
    thumbnail: '/images/array.png',
    title: 'Arrays 101',
    description: 'Introduction to Data Structure',
    chapters: 6,
    items: 31,
    completed: 90,
  },
  {
    id: 7,
    thumbnail: '/images/google_interview.png',
    title: 'Google Interview',
    description: 'Get Well Prepared for',
    chapters: 9,
    items: 85,
    completed: 100,
  },
];
