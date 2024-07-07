"use client";
import Link from "next/link";
import React, { useContext } from "react";
// import { UserContext } from "../context/UserContext";
import { useRouter } from "next/navigation";
import { BannerCard } from "../components/BannerCard";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, ArrowRight } from "react-feather";
import CentralizedButton from "../components/common/CentralizedButton";
export default function LandingPage() {
  // const { user, authenticated, setAuthenticated } = useContext(UserContext);
  // console.log(user?.userInfo);

  const handleLogout = async () => {
    try {
      const response = await fetch(
        (process.env.NEXT_PUBLIC_BASE_URL ||
          "https://mrengineersapi.vercel.app") + "/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        // setAuthenticated(false);
        toast.success("Logged out successfully!");
      } else {
        toast.error("Failed to logout.");
      }
    } catch (error) {
      console.error("Failed to logout:", error.message);
    }
  };
  return (
    <main className="flex flex-col text-gray-900">
      <section className="bg-gray-100 py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-blod tracking-tighter sm:text-4xl md:text-5xl lg:text-5xl/none">
                  Hello ,{" "}
                  {false ? (
                    <span className="text-blue-800">
                      {user?._doc.fullName?.split(" ")[0]}
                    </span>
                  ) : (
                    <span className="text-blue-800">Guest</span>
                  )}
                </h1>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Welcome to Mr. Engineers
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  Discover a world of opportunities to grow your engineering
                  skills, explore cutting-edge technologies, and build a
                  successful career with our comprehensive resources and
                  personalized support.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <CentralizedButton
                  href={false ? "dashboard" : "/u/register"}
                  icon={ArrowRight}
                  isIconRightSide
                  text={false ? "Start your journey" : "Get Started"}
                  color="info"
                  size="lg"
                  style={{ display: "flex", justifyContent: "center" }}
                />
                {false ? (
                  <CentralizedButton
                    text="logout"
                    onClick={handleLogout}
                    outline
                    size="lg"
                    color="info"
                    style={{ display: "flex", justifyContent: "center" }}
                  />
                ) : (
                  <CentralizedButton
                    href="/u/login"
                    text="login"
                    color="info"
                    outline
                    size="lg"
                    style={{ display: "flex", justifyContent: "center" }}
                  />
                )}
              </div>
            </div>
            <BannerCard />
          </div>
        </div>
      </section>
      <section className="bg-light py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">
                  Learning Resources
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Expand Your Knowledge
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Dive into a vast library of tutorials, articles, and video
                  lessons covering the latest engineering technologies and
                  practices.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {/* <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                  href="/resources"
                >
                  Explore Resources
                </Link> */}

                <CentralizedButton
                  size="lg"
                  color="info"
                  href="/resources"
                  text="Explore Resources"
                  style={{ display: "flex", justifyContent: "center" }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ResourceCard
                icon={<BookIcon className="h-8 w-8 text-gray-500" />}
                title="Tutorials"
                description="Step-by-step guides to master new technologies."
              />
              <ResourceCard
                icon={<VideoIcon className="h-8 w-8 text-gray-500" />}
                title="Video Lessons"
                description="Interactive video lessons for hands-on learning."
              />
              <ResourceCard
                icon={<FileIcon className="h-8 w-8 text-gray-500" />}
                title="Articles"
                description="In-depth articles on the latest engineering trends."
              />
              <ResourceCard
                icon={<PuzzleIcon className="h-8 w-8 text-gray-500" />}
                title="Coding Challenges"
                description="Sharpen your skills with interactive coding challenges."
              />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gray-100 py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <img
              alt="Career Roadmap"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              height="310"
              src="/career-roadmap.svg"
              width="550"
            />
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">
                  Career Roadmap
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Discover Your Path to Success
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get a personalized roadmap to guide you through your
                  engineering journey, from skill development to landing your
                  dream job.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {/* <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                  href="/u/register"
                >
                  Get Your Roadmap
                </Link> */}

                <CentralizedButton
                  href="/career-roadmap"
                  text="Get Your Roadmap"
                  color="info"
                  size="lg"
                  style={{ display: "flex", justifyContent: "center" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-light py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">
                  Placement Preparation
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ace Your Dream Job
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get comprehensive support to prepare for campus placements,
                  including mock interviews, resume building, and negotiation
                  strategies.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {/* <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                  href="/u/register"
                >
                  Explore Placement Support
                </Link> */}
                <CentralizedButton
                  text="Explore Placement Support"
                  href="placement-preparation"
                  color="info"
                  size="lg"
                  style={{ display: "flex", justifyContent: "center" }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ResourceCard
                icon={<BriefcaseIcon className="h-8 w-8 text-gray-500" />}
                title="Mock Interviews"
                description="Practice with industry experts."
              />
              <ResourceCard
                icon={<PresentationIcon className="h-8 w-8 text-gray-500" />}
                title="Resume Building"
                description="Create a winning resume that stands out."
              />
              <ResourceCard
                icon={<ChatIcon className="h-8 w-8 text-gray-500" />}
                title="Negotiation Tips"
                description="Learn to negotiate offers effectively."
              />
              <ResourceCard
                icon={<ChartIcon className="h-8 w-8 text-gray-500" />}
                title="Career Counseling"
                description="Get personalized career advice from experts."
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ResourceCard({ icon, title, description }) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  );
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
  );
}

function VideoIcon({ className }) {
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
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 8h4l1.5 2H13L15 8h3m-9 4v5a1 1 0 001 1h5a1 1 0 001-1v-5m-8 0h14"
      ></path>
    </svg>
  );
}

function FileIcon({ className }) {
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
        d="M8 7h8M8 11h8m-8 4h4m-2 4h6a2 2 0 002-2V7a2 2 0 00-2-2h-8a2 2 0 00-2 2v10a2 2 0 002 2z"
      ></path>
    </svg>
  );
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
  );
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
  );
}

function PresentationIcon({ className }) {
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
        d="M5 3h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zM3 7h18M12 3v18m-6-6l6 6m0-6l6 6"
      ></path>
    </svg>
  );
}

function ChatIcon({ className }) {
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
        d="M7 8h10M7 12h5m-5 4h8m5 1a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
  );
}

function ChartIcon({ className }) {
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
  );
}
