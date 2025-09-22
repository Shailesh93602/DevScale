'use client';
import { HoverBorderGradient } from '@/components/HoverBorderGradient';
import Image from 'next/image';
import { AceternityLogo } from '@/components/AceternityLogo';
import { useToast } from '@/hooks/use-toast';

export default function Community() {
  const { toast } = useToast();
  return (
    <div className="py-4">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="mb-6 text-4xl font-bold">Community</h1>

        <div className="mb-8 rounded-lg bg-lightSecondary p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold">Discussion Forums</h2>
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
              className="flex items-center space-x-2 bg-primary text-white hover:bg-primary2"
              onClick={() =>
                toast({
                  title: 'Coming Soon',
                  description: 'Discussion forums are under development.',
                })
              }
            >
              <AceternityLogo />
              <span> Join Discussions</span>
            </HoverBorderGradient>
          </div>
        </div>

        <div className="mb-8 rounded-lg bg-lightSecondary p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold">Upcoming Events</h2>
          <p>
            Stay updated with our upcoming events. From webinars to hackathons,
            be a part of events that enhance your learning and networking
            opportunities.
          </p>
          <div className="pt-4">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="flex items-center space-x-2 bg-primary text-white hover:bg-primary2"
              onClick={() =>
                toast({
                  title: 'Coming Soon',
                  description: 'Event calendar is under development.',
                })
              }
            >
              <AceternityLogo />
              <span>View Events</span>
            </HoverBorderGradient>
          </div>
        </div>

        <div className="mb-8 rounded-lg bg-lightSecondary p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold">Member Highlights</h2>
          <p>
            Discover stories and achievements of our community members. Get
            inspired by their journeys and learn from their experiences.
          </p>
          <div className="pt-4">
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="flex items-center space-x-2 bg-primary text-white hover:bg-primary2"
              onClick={() =>
                toast({
                  title: 'Coming Soon',
                  description: 'Member highlights are under development.',
                })
              }
            >
              <AceternityLogo />
              <span>View Highlights</span>
            </HoverBorderGradient>
          </div>
        </div>

        <div className="rounded-lg bg-lightSecondary p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold">
            Collaboration Opportunities
          </h2>
          <p>
            Collaborate with fellow community members on projects and
            initiatives. Find opportunities to work together and achieve common
            goals.
          </p>
          <div className="pt-4">
            {' '}
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="flex items-center space-x-2 bg-primary hover:bg-primary2"
              onClick={() =>
                toast({
                  title: 'Coming Soon',
                  description:
                    'Collaboration opportunities are under development.',
                })
              }
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
