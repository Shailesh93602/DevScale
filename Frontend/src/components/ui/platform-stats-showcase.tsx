'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { CustomLink } from '@/components/ui/custom-link';
import {
  FaTrophy,
  FaCode,
  FaLaptopCode,
  FaChartLine,
  FaUsers,
  FaGraduationCap,
  FaLightbulb,
} from 'react-icons/fa';

interface PlatformStatsShowcaseProps {
  className?: string;
}

export const PlatformStatsShowcase = ({
  className,
}: PlatformStatsShowcaseProps) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const isAuthenticated = useSelector(
    (state: { user: { isAuthenticated: boolean } }) =>
      state?.user?.isAuthenticated,
  );

  // Define the tabs with their content
  const tabs = [
    {
      name: 'Learning Paths',
      icon: <FaGraduationCap />,
      title: 'Choose Your Path',
      description:
        'Select from curated roadmaps or create your own custom learning journey.',
      stats: [
        { label: 'Active Users', value: '10,000+', icon: <FaUsers /> },
        { label: 'Roadmaps', value: '50+', icon: <FaRoad /> },
        { label: 'Company Guides', value: '200+', icon: <FaLaptopCode /> },
        { label: 'Achievements', value: '100+', icon: <FaTrophy /> },
      ],
      features: [
        'Personalized learning recommendations',
        'Progress tracking and milestones',
        'Hands-on projects and assignments',
        'Industry-aligned curriculum',
      ],
      testimonial: {
        quote:
          'The platform has been a game-changer for me. It helped me stay organized and focused on my learning goals.',
        author: 'Alex R.',
      },
    },
    {
      name: 'Community',
      icon: <FaUsers />,
      title: 'Track Progress',
      description:
        'Monitor your advancement with visual indicators and completion metrics.',
      stats: [
        { label: 'Active Users', value: '10,000+', icon: <FaUsers /> },
        { label: 'Roadmaps', value: '50+', icon: <FaRoad /> },
        { label: 'Company Guides', value: '200+', icon: <FaLaptopCode /> },
        { label: 'Achievements', value: '100+', icon: <FaTrophy /> },
      ],
      features: [
        'Peer code reviews and feedback',
        'Live coding sessions and workshops',
        'Doubt resolution within minutes',
        'Networking opportunities',
      ],
      testimonial: {
        quote:
          'The community aspect is what sets this platform apart. It’s a great place to learn and connect with like-minded individuals.',
        author: 'Sarah K.',
      },
    },
    {
      name: 'Career Growth',
      icon: <FaChartLine />,
      title: 'Accelerate Your Career',
      description:
        'Get the skills, credentials, and connections to advance your career.',
      stats: [
        { label: 'Active Users', value: '10,000+', icon: <FaUsers /> },
        { label: 'Roadmaps', value: '50+', icon: <FaRoad /> },
        { label: 'Company Guides', value: '200+', icon: <FaLaptopCode /> },
        { label: 'Achievements', value: '100+', icon: <FaTrophy /> },
      ],
      features: [
        'Resume building and review',
        'Mock interviews with feedback',
        'Job placement assistance',
        'Industry networking events',
      ],
      testimonial: {
        quote:
          'The career growth resources on this platform have been invaluable. They’ve helped me prepare for interviews and land my dream job.',
        author: 'Mike Johnson',
      },
    },
    {
      name: 'Challenges',
      icon: <FaLightbulb />,
      title: 'Earn Achievements',
      description:
        'Unlock badges and certificates as you master new skills and concepts.',
      stats: [
        { label: 'Active Users', value: '10,000+', icon: <FaUsers /> },
        { label: 'Roadmaps', value: '50+', icon: <FaRoad /> },
        { label: 'Company Guides', value: '200+', icon: <FaLaptopCode /> },
        { label: 'Achievements', value: '100+', icon: <FaTrophy /> },
      ],
      features: [
        'Coding competitions with prizes',
        'Real-world problem solving',
        'Leaderboards and rankings',
        'Skill-based achievements',
      ],
      testimonial: {
        quote:
          'The challenges on this platform have pushed me to learn and grow. They’re a fun way to test my skills and earn recognition.',
        author: 'Emily Brown',
      },
    },
  ];

  // Auto-rotate through tabs
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % tabs.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [tabs.length]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-card shadow-xl',
        className,
      )}
    >
      {/* Background decorative elements */}
      <div className="bg-primary/10 absolute -left-20 -top-20 h-40 w-40 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-secondary/10 blur-3xl"></div>

      {/* Tab navigation */}
      <div className="border-b border-border bg-muted/20">
        <div className="flex">
          {tabs.map((tab, index) => (
            <motion.button
              key={index}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-all duration-200 sm:text-base',
                activeTab === index
                  ? 'border-primary bg-card text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
              )}
              onClick={() => setActiveTab(index)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="hidden sm:inline">{tab.icon}</span>
              <span>{tab.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left column - Content */}
              <div>
                <h3 className="mb-2 text-2xl font-bold text-foreground">
                  {tabs[activeTab].title}
                </h3>
                <p className="mb-6 text-muted-foreground">
                  {tabs[activeTab].description}
                </p>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-3 gap-4">
                  {tabs[activeTab].stats.map((stat, i) => (
                    <motion.div
                      key={i}
                      className="flex flex-col items-center rounded-lg border border-border bg-muted/20 p-3 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="bg-primary/10 mb-1 flex h-10 w-10 items-center justify-center rounded-full text-primary">
                        {stat.icon}
                      </div>
                      <div className="mt-2 text-xl font-bold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Key Features
                  </h4>
                  <div className="space-y-2">
                    {tabs[activeTab].features.map((feature, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center rounded-lg border border-border bg-card p-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M10 3L4.5 8.5L2 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Testimonial */}
                <motion.div
                  className="from-primary/5 rounded-xl bg-gradient-to-r to-secondary/5 p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="mb-3 text-sm italic text-muted-foreground">
                    &ldquo;{tabs[activeTab].testimonial.quote}&rdquo;
                  </p>
                  <p className="text-right text-xs font-medium text-muted-foreground">
                    — {tabs[activeTab].testimonial.author}
                  </p>
                </motion.div>
              </div>

              {/* Right column - Visual */}
              <div className="flex items-center justify-center">
                <motion.div
                  className="from-primary/10 relative h-64 w-64 rounded-xl bg-gradient-to-br to-secondary/10 p-6"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                >
                  <div className="flex h-full w-full items-center justify-center">
                    {/* Placeholder for actual images */}
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-card text-5xl text-primary shadow-lg">
                      {tabs[activeTab].icon}
                    </div>
                  </div>

                  {/* Floating elements for visual interest */}
                  <motion.div
                    className="absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: 'easeInOut',
                    }}
                  >
                    <FaTrophy />
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-4 -left-4 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg"
                    animate={{
                      y: [0, 10, 0],
                      rotate: [0, -5, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      ease: 'easeInOut',
                    }}
                  >
                    <FaCode />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Call to action */}
      <div className="border-t border-border bg-muted/20 p-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Join thousands of engineers accelerating their careers
          </p>
          <CustomLink
            variant="default"
            href={isAuthenticated ? '/dashboard' : '/auth/register'}
            className="rounded-full px-6"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
          </CustomLink>
        </div>
      </div>
    </div>
  );
};

// Helper components
const FaRoad = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
  </svg>
);
