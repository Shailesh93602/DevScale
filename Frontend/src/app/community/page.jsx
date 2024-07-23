"use client";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { AceternityLogo } from "../page";

export default function Community() {
  const router = useRouter();

  return (
    <div className="min-h-screen  dark:bg-gray-800  bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold dark:text-gray-200 text-gray-900 mb-6">
          Community
        </h1>

        <div className="bg-light dark:bg-gray-600 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl dark:text-gray-200   font-semibold text-gray-800 mb-4">
            Discussion Forums
          </h2>
          <Image
            src="/community.svg"
            alt="Discussion Forums"
            width={550}
            height={310}
          />
          <p className="mt-4 dark:text-gray-200 text-gray-600">
            Join our discussion forums to share your thoughts, ask questions,
            and connect with other community members. Participate in various
            topics and grow together.
          </p>
          <div className="pt-4">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
            >
              <AceternityLogo />
              <span> Join Discussions</span>
            </HoverBorderGradient>
          </div>
        </div>

        <div className="bg-light dark:bg-gray-600 dark:text-gray-200 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl dark:text-gray-200 font-semibold text-gray-800 mb-4">
            Upcoming Events
          </h2>
          <p className="dark:text-gray-300 text-gray-600">
            Stay updated with our upcoming events. From webinars to hackathons,
            be a part of events that enhance your learning and networking
            opportunities.
          </p>
          <div className="pt-4">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
            >
              <AceternityLogo />
              <span>View Events</span>
            </HoverBorderGradient>
          </div>
        </div>

        <div className="bg-light dark:bg-gray-600 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl dark:text-gray-200 font-semibold text-gray-800 mb-4">
            Member Highlights
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Discover stories and achievements of our community members. Get
            inspired by their journeys and learn from their experiences.
          </p>
          <div className="pt-4">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
            >
              <AceternityLogo />
              <span>View Highlights</span>
            </HoverBorderGradient>
          </div>
        </div>

        <div className="bg-light dark:bg-gray-600 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold dark:text-gray-200 text-gray-800 mb-4">
            Collaboration Opportunities
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Collaborate with fellow community members on projects and
            initiatives. Find opportunities to work together and achieve common
            goals.
          </p>
          <div className="pt-4">
            {" "}
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
            >
              <AceternityLogo />
              <span>Find Opportunities</span>
            </HoverBorderGradient>
          </div>
        </div>
      </div>
    </div>
  );
}
