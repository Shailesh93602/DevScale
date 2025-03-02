'use client';
import React, { ReactNode } from 'react';

import { HeroParallax } from '@/components/HeroParallax';
import { StickyScroll } from '@/components/StickyScrollReveal';
import { CardDemo } from '@/components/CardDemo';
import { HoverBorderGradient } from '@/components/HoverBorderGradient';
import { content, products } from '@/constants';
import { AceternityLogo } from '@/components/AceternityLogo';

export default function LandingPage() {
  return (
    <main className="flex flex-col bg-light text-dark">
      <HeroParallax products={products} />
      <section className='lg:py-28" py-12 pt-5 md:py-20'>
        <div className="pb-8">
          <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">
            Learning Resources
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Expand Your Knowledge
          </h2>
        </div>
        <StickyScroll content={content} />
      </section>

      <section className="bg-gray-600 py-12 md:py-20 lg:py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <CardDemo
            // className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
            />
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">
                  Career Roadmap
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Discover Your Path to Success
                </h2>
                <p className="max-w-[600px] text-white md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get a personalized roadmap to guide you through your
                  engineering journey, from skill development to landing your
                  dream job.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  href="/career-roadmap"
                  as="button"
                  className="flex items-center space-x-2 bg-white text-black dark:bg-black dark:text-white"
                >
                  <AceternityLogo />
                  <span>Get Your Roadmap</span>
                </HoverBorderGradient>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gray-600 py-12 md:py-20 lg:py-28">
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
                <p className="max-w-[600px] text-white md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get comprehensive support to prepare for campus placements,
                  including mock interviews, resume building, and negotiation
                  strategies.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  href="/placement-preparation"
                  className="flex items-center space-x-2 bg-white text-black dark:bg-black dark:text-white"
                >
                  <AceternityLogo />
                  <span>Explore Placement Support</span>
                </HoverBorderGradient>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ResourceCard
                icon={<BriefcaseIcon className="h-8 w-8 text-white" />}
                title="Mock Interviews"
                description="Practice with industry experts."
              />
              <ResourceCard
                icon={<PresentationIcon className="h-8 w-8 text-white" />}
                title="Resume Building"
                description="Create a winning resume that stands out."
              />
              <ResourceCard
                icon={<ChatIcon className="h-8 w-8 text-white" />}
                title="Negotiation Tips"
                description="Learn to negotiate offers effectively."
              />
              <ResourceCard
                icon={<ChartIcon className="h-8 w-8 text-white" />}
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

function ResourceCard({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title?: string;
  description?: string;
}) {
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

// function BookIcon({ className }: { className?: string;  }) {
//   return (
//     <svg
//       className={className}
//       fill="none"
//       stroke="currentColor"
//       viewBox="0 0 24 24"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth="2"
//         d="M4 19.5A2.5 2.5 0 016.5 17H20m0 0v-2a2 2 0 00-2-2H6.5a2.5 2.5 0 00-2.5 2.5v.5m16-1h-1a2 2 0 00-2 2v2M4 19.5A2.5 2.5 0 016.5 22H20m-14-3v2a2 2 0 002 2h11.5a2.5 2.5 0 002.5-2.5v-2.5"
//       ></path>
//     </svg>
//   );
// }

// function VideoIcon({ className }: { className?: string}) {
//   return (
//     <svg
//       className={className}
//       fill="none"
//       stroke="currentColor"
//       viewBox="0 0 24 24"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth="2"
//         d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 8h4l1.5 2H13L15 8h3m-9 4v5a1 1 0 001 1h5a1 1 0 001-1v-5m-8 0h14"
//       ></path>
//     </svg>
//   );
// }

// function FileIcon({ className }: { className?: string }) {
//   return (
//     <svg
//       className={className}
//       fill="none"
//       stroke="currentColor"
//       viewBox="0 0 24 24"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth="2"
//         d="M8 7h8M8 11h8m-8 4h4m-2 4h6a2 2 0 002-2V7a2 2 0 00-2-2h-8a2 2 0 00-2 2v10a2 2 0 002 2z"
//       ></path>
//     </svg>
//   );
// }

// function PuzzleIcon({ className }: { className?: string;  }) {
//   return (
//     <svg
//       className={className}
//       fill="none"
//       stroke="currentColor"
//       viewBox="0 0 24 24"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth="2"
//         d="M17 9.2a3 3 0 11-2.7-2.7m-4.6 6.4a3 3 0 11-2.7-2.7m0 0a3 3 0 013.74 1.26m3.74-3.74A3 3 0 1115.8 9M9 3a3 3 0 110 6H5a2 2 0 00-2 2v4a3 3 0 106 0v-1h6v1a3 3 0 106 0V9a2 2 0 00-2-2h-4a3 3 0 01-6 0V3z"
//       ></path>
//     </svg>
//   );
// }

function BriefcaseIcon({ className }: { className?: string }) {
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

function PresentationIcon({ className }: { className?: string }) {
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

function ChatIcon({ className }: { className?: string }) {
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

function ChartIcon({ className }: { className?: string }) {
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
