"use client";
import { useEffect, useState } from "react"
import Link from "next/link"

export default function HomePage() {
    const [userName, setUserName] = useState("")

    useEffect(() => {
        const fetchUserData = async () => {
            const user = { name: "John Doe" }
            setUserName(user.name)
        }
        fetchUserData()
    }, [])

    return (
        <main className="flex flex-col bg-white">
            <section className="bg-white py-12 md:py-20 lg:py-28">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
                                Your Dashboard
                            </h2>
                            <p className="max-w-[600px] text-gray-500 md:text-xl">
                                Access all your learning resources, career roadmap, and placement preparation materials here.
                            </p>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <DashboardCard
                                    icon={<BookIcon className="h-10 w-10 text-gray-700" />}
                                    title="Learning Resources"
                                    description="Tutorials, video lessons, and articles to expand your knowledge."
                                    link="/resources"
                                />
                                <DashboardCard
                                    icon={<PuzzleIcon className="h-10 w-10 text-gray-700" />}
                                    title="Coding Challenges"
                                    description="Practice your skills with interactive challenges."
                                    link="/coding-challenges"
                                />
                                <DashboardCard
                                    icon={<RoadmapIcon className="h-10 w-10 text-gray-700" />}
                                    title="Career Roadmap"
                                    description="Personalized roadmap to guide your engineering journey."
                                    link="/career-roadmap"
                                />
                                <DashboardCard
                                    icon={<BriefcaseIcon className="h-10 w-10 text-gray-700" />}
                                    title="Placement Preparation"
                                    description="Mock interviews, resume building, and more."
                                    link="/placement-preparation"
                                />
                            </div>
                        </div>
                        <img
                            alt="Dashboard"
                            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                            height="310"
                            src="/dashboard.svg"
                            width="550"
                        />
                    </div>
                </div>
            </section>
        </main>
    )
}

function DashboardCard({ icon, title, description, link }) {
    return (
        <div className="flex flex-col items-start p-4 bg-gray-100 rounded-lg shadow">
            <div className="mb-2">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600">{description}</p>
            <Link
                className="mt-2 text-sm text-blue-600 hover:underline"
                href={link}
            >
                Learn More
            </Link>
        </div>
    )
}

function BookIcon({ className }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 19.5A2.5 2.5 0 016.5 17H20m0 0v-2a2 2 0 00-2-2H6.5a2.5 2.5 0 00-2.5 2.5v.5m16-1h-1a2 2 0 00-2 2v2M4 19.5A2.5 2.5 0 016.5 22H20m-14-3v2a2 2 0 002 2h11.5a2.5 2.5 0 002.5-2.5v-2.5"
            ></path>
        </svg>
    )
}

function PuzzleIcon({ className }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 9.2a3 3 0 11-2.7-2.7m-4.6 6.4a3 3 0 11-2.7-2.7m0 0a3 3 0 013.74 1.26m3.74-3.74A3 3 0 1115.8 9M9 3a3 3 0 110 6H5a2 2 0 00-2 2v4a3 3 0 106 0v-1h6v1a3 3 0 106 0V9a2 2 0 00-2-2h-4a3 3 0 01-6 0V3z"
            ></path>
        </svg>
    )
}

function RoadmapIcon({ className }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
            ></path>
        </svg>
    )
}

function BriefcaseIcon({ className }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7h-1V4a2 2 0 00-2-2H11a2 2 0 00-2 2v3H8a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2zM7 7V4a3 3 0 013-3h3a3 3 0 013 3v3"
            ></path>
        </svg>
    )
}
