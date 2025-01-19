"use client";
import { HoverBorderGradient } from "@/components/hover-border-gradient";
import Image from "next/image";
import { AceternityLogo } from "@/components/AceternityLogo";

export default function Community() {
  return (
    <div className="py-4">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-6">Community</h1>

        <div className="bg-lightSecondary rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Discussion Forums</h2>
          <Image
            src="/community.svg"
            alt="Discussion Forums"
            width={550}
            height={310}
          />
          <p className="mt-4">
            Join our discussion forums to share your thoughts, ask questions,
            and connect with other community members. Participate in various
            topics and grow together.
          </p>
          <div className="pt-4">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="bg-primary text-white hover:bg-primary2 flex items-center space-x-2"
            >
              <AceternityLogo />
              <span> Join Discussions</span>
            </HoverBorderGradient>
          </div>
        </div>

        <div className="bg-lightSecondary rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
          <p>
            Stay updated with our upcoming events. From webinars to hackathons,
            be a part of events that enhance your learning and networking
            opportunities.
          </p>
          <div className="pt-4">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="bg-primary text-white hover:bg-primary2 flex items-center space-x-2"
            >
              <AceternityLogo />
              <span>View Events</span>
            </HoverBorderGradient>
          </div>
        </div>

        <div className="bg-lightSecondary rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Member Highlights</h2>
          <p>
            Discover stories and achievements of our community members. Get
            inspired by their journeys and learn from their experiences.
          </p>
          <div className="pt-4">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="bg-primary text-white hover:bg-primary2 flex items-center space-x-2"
            >
              <AceternityLogo />
              <span>View Highlights</span>
            </HoverBorderGradient>
          </div>
        </div>

        <div className="bg-lightSecondary rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Collaboration Opportunities
          </h2>
          <p>
            Collaborate with fellow community members on projects and
            initiatives. Find opportunities to work together and achieve common
            goals.
          </p>
          <div className="pt-4">
            {" "}
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="bg-primary hover:bg-primary2 flex items-center space-x-2"
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
