// "use client";
// import { useEffect, useState } from "react"
// import Link from "next/link"

// export default function HomePage() {
//     const [userName, setUserName] = useState("")

//     useEffect(() => {
//         const fetchUserData = async () => {
//             const user = { name: "John Doe" }
//             setUserName(user.name)
//         }
//         fetchUserData()
//     }, [])

//     return (
//         <main className="flex flex-col bg-white">
//             <section className="bg-white py-12 md:py-20 lg:py-28">
//                 <div className="container px-4 md:px-6">
//                     <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
//                         <div className="space-y-4">
//                             <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
//                                 Your Dashboard
//                             </h2>
//                             <p className="max-w-[600px] text-gray-500 md:text-xl">
//                                 Access all your learning resources, career roadmap, and placement preparation materials here.
//                             </p>
//                             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                                 <DashboardCard
//                                     icon={<BookIcon className="h-10 w-10 text-gray-700" />}
//                                     title="Learning Resources"
//                                     description="Tutorials, video lessons, and articles to expand your knowledge."
//                                     link="/resources"
//                                 />
//                                 <DashboardCard
//                                     icon={<PuzzleIcon className="h-10 w-10 text-gray-700" />}
//                                     title="Coding Challenges"
//                                     description="Practice your skills with interactive challenges."
//                                     link="/coding-challenges"
//                                 />
//                                 <DashboardCard
//                                     icon={<RoadmapIcon className="h-10 w-10 text-gray-700" />}
//                                     title="Career Roadmap"
//                                     description="Personalized roadmap to guide your engineering journey."
//                                     link="/career-roadmap"
//                                 />
//                                 <DashboardCard
//                                     icon={<BriefcaseIcon className="h-10 w-10 text-gray-700" />}
//                                     title="Placement Preparation"
//                                     description="Mock interviews, resume building, and more."
//                                     link="/placement-preparation"
//                                 />
//                             </div>
//                         </div>
//                         <img
//                             alt="Dashboard"
//                             className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
//                             height="310"
//                             src="/dashboard.svg"
//                             width="550"
//                         />
//                     </div>
//                 </div>
//             </section>
//         </main>
//     )
// }

// function DashboardCard({ icon, title, description, link }) {
//     return (
//         <div className="flex flex-col items-start p-4 bg-gray-100 rounded-lg shadow">
//             <div className="mb-2">{icon}</div>
//             <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//             <p className="text-gray-600">{description}</p>
//             <Link
//                 className="mt-2 text-sm text-blue-600 hover:underline"
//                 href={link}
//             >
//                 Learn More
//             </Link>
//         </div>
//     )
// }

// function BookIcon({ className }) {
//     return (
//         <svg
//             className={className}
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//             xmlns="http://www.w3.org/2000/svg"
//         >
//             <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M4 19.5A2.5 2.5 0 016.5 17H20m0 0v-2a2 2 0 00-2-2H6.5a2.5 2.5 0 00-2.5 2.5v.5m16-1h-1a2 2 0 00-2 2v2M4 19.5A2.5 2.5 0 016.5 22H20m-14-3v2a2 2 0 002 2h11.5a2.5 2.5 0 002.5-2.5v-2.5"
//             ></path>
//         </svg>
//     )
// }

// function PuzzleIcon({ className }) {
//     return (
//         <svg
//             className={className}
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//             xmlns="http://www.w3.org/2000/svg"
//         >
//             <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M17 9.2a3 3 0 11-2.7-2.7m-4.6 6.4a3 3 0 11-2.7-2.7m0 0a3 3 0 013.74 1.26m3.74-3.74A3 3 0 1115.8 9M9 3a3 3 0 110 6H5a2 2 0 00-2 2v4a3 3 0 106 0v-1h6v1a3 3 0 106 0V9a2 2 0 00-2-2h-4a3 3 0 01-6 0V3z"
//             ></path>
//         </svg>
//     )
// }

// function RoadmapIcon({ className }) {
//     return (
//         <svg
//             className={className}
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//             xmlns="http://www.w3.org/2000/svg"
//         >
//             <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M4 6h16M4 10h16M4 14h16M4 18h16"
//             ></path>
//         </svg>
//     )
// }

// function BriefcaseIcon({ className }) {
//     return (
//         <svg
//             className={className}
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//             xmlns="http://www.w3.org/2000/svg"
//         >
//             <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M16 7h-1V4a2 2 0 00-2-2H11a2 2 0 00-2 2v3H8a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2zM7 7V4a3 3 0 013-3h3a3 3 0 013 3v3"
//             ></path>
//         </svg>
//     )
// }


import React from 'react';

export default function Home() {
  return (
    <div className="p-6 bg-zinc-100 dark:bg-zinc-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Welcome,</h1>
        <h2 className="text-4xl font-bold mb-8 text-zinc-900 dark:text-zinc-100">Shailesh Chaudhari</h2>

        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Continue Previous:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
              <img src="https://placehold.co/200x100" alt="Course Thumbnail" className="rounded-lg w-full mb-4" />
              <div className="">
                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Dynamic Programming</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Detailed Explanation of</p>
                <div className="absolute bottom-[70px] right-[-15px] transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-16 h-16 bg-white rounded-full border-4 border-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M7 6v12l10-6z"></path>
                </svg>
                </div>
                {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 border-blue-500" style={{ clipPath: 'inset(50% 0 0 0)' }}>
                  <div className="absolute top-0 left-0 w-full h-full bg-blue-500" style={{ clipPath: 'inset(0 50% 50% 0)' }}></div>
                </div> */}
                <div className="mt-2 flex items-center">
                  <div className="text-zinc-900 dark:text-zinc-100 mr-4">
                    <span>6</span> Chapters
                  </div>
                  <div className="text-zinc-900 dark:text-zinc-100 mr-4">
                    <span>55</span> Items
                  </div>
                </div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  7% Completed
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">Featured</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map(course => (
              <div key={course.id} className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
                <img src={course.thumbnail} alt="Course Thumbnail" className="rounded-lg w-full mb-4" />
                <div className="">
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{course.title}</h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{course.description}</p>
                  <div className="absolute top-1/2 right-[-15px] transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-16 h-16 bg-white rounded-full border-4 border-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M7 6v12l10-6z"></path>
                </svg>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 border-blue-500" style={{ clipPath: `inset(${100 - course.completed}% 0 0 0)` }}>
                    <div className="absolute top-0 left-0 w-full h-full bg-blue-500" style={{ clipPath: `inset(0 ${course.completed}% ${100 - course.completed}% 0)` }}></div>
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <div className="text-zinc-900 dark:text-zinc-100 mr-4">
                    <span>{course.chapters}</span> Chapters
                  </div>
                  <div className="text-zinc-900 dark:text-zinc-100 mr-4">
                    <span>{course.items}</span> Items
                  </div>
                </div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {course.completed}% Completed
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
    completed: 0,
  },
  {
    id: 3,
    thumbnail: "https://placehold.co/200x100",
    title: "The LeetCode Beginner's Guide",
    description: "",
    chapters: 4,
    items: 17,
    completed: 0,
  },
  {
    id: 4,
    thumbnail: "https://placehold.co/200x100",
    title: "Top Interview Questions",
    description: "Easy Collection",
    chapters: 9,
    items: 48,
    completed: 0,
  },
  {
    id: 5,
    thumbnail: "https://placehold.co/200x100",
    title: "Dynamic Programming",
    description: "Detailed Explanation of",
    chapters: 6,
    items: 55,
    completed: 7,
  },
  {
    id: 6,
    thumbnail: "https://placehold.co/200x100",
    title: "Arrays 101",
    description: "Introduction to Data Structure",
    chapters: 6,
    items: 31,
    completed: 0,
  },
  {
    id: 7,
    thumbnail: "https://placehold.co/200x100",
    title: "Google Interview",
    description: "Get Well Prepared for",
    chapters: 9,
    items: 85,
    completed: 0,
  },
];
