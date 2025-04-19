'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  FaTrophy,
  FaLaptopCode,
  FaChartLine,
  FaUsers,
  FaGraduationCap,
  FaLightbulb,
  FaRoad,
} from 'react-icons/fa';

interface PlatformStatsShowcaseDarkProps {
  className?: string;
}

export const PlatformStatsShowcaseDark = ({
  className,
}: PlatformStatsShowcaseDarkProps) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  // Define the tabs with their content
  const tabs = [
    {
      name: 'Learning Paths',
      icon: <FaGraduationCap />,
      title: 'Choose Your Path',
      description:
        'Select from curated roadmaps or create your own custom learning journey.',
      stats: [
        {
          label: 'Active Users',
          value: '10,000+',
          icon: <FaUsers size={24} />,
        },
        { label: 'Roadmaps', value: '50+', icon: <FaRoad size={24} /> },
        {
          label: 'Company Guides',
          value: '200+',
          icon: <FaLaptopCode size={24} />,
        },
        { label: 'Achievements', value: '100+', icon: <FaTrophy size={24} /> },
      ],
      features: [
        'Personalized learning recommendations',
        'Progress tracking and milestones',
        'Hands-on projects and assignments',
        'Industry-aligned curriculum',
      ],
    },
    {
      name: 'Community',
      icon: <FaUsers />,
      title: 'Track Progress',
      description:
        'Monitor your advancement with visual indicators and completion metrics.',
      stats: [
        {
          label: 'Active Users',
          value: '10,000+',
          icon: <FaUsers size={24} />,
        },
        { label: 'Roadmaps', value: '50+', icon: <FaRoad size={24} /> },
        {
          label: 'Company Guides',
          value: '200+',
          icon: <FaLaptopCode size={24} />,
        },
        { label: 'Achievements', value: '100+', icon: <FaTrophy size={24} /> },
      ],
      features: [
        'Peer code reviews and feedback',
        'Live coding sessions and workshops',
        'Doubt resolution within minutes',
        'Networking opportunities',
      ],
    },
    {
      name: 'Career Growth',
      icon: <FaChartLine />,
      title: 'Accelerate Your Career',
      description:
        'Get the skills, credentials, and connections to advance your career.',
      stats: [
        {
          label: 'Active Users',
          value: '10,000+',
          icon: <FaUsers size={24} />,
        },
        { label: 'Roadmaps', value: '50+', icon: <FaRoad size={24} /> },
        {
          label: 'Company Guides',
          value: '200+',
          icon: <FaLaptopCode size={24} />,
        },
        { label: 'Achievements', value: '100+', icon: <FaTrophy size={24} /> },
      ],
      features: [
        'Resume building and review',
        'Mock interviews with feedback',
        'Job placement assistance',
        'Industry networking events',
      ],
    },
    {
      name: 'Challenges',
      icon: <FaLightbulb />,
      title: 'Earn Achievements',
      description:
        'Unlock badges and certificates as you master new skills and concepts.',
      stats: [
        {
          label: 'Active Users',
          value: '10,000+',
          icon: <FaUsers size={24} />,
        },
        { label: 'Roadmaps', value: '50+', icon: <FaRoad size={24} /> },
        {
          label: 'Company Guides',
          value: '200+',
          icon: <FaLaptopCode size={24} />,
        },
        { label: 'Achievements', value: '100+', icon: <FaTrophy size={24} /> },
      ],
      features: [
        'Coding competitions with prizes',
        'Real-world problem solving',
        'Leaderboards and rankings',
        'Skill-based achievements',
      ],
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
        'relative overflow-hidden rounded-xl bg-black text-white',
        className,
      )}
    >
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-8 p-8 md:grid-cols-4">
        {tabs[activeTab].stats.map((stat, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-800">
              {stat.icon}
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="flex border-t border-gray-800">
        {tabs.map((tab, index) => (
          <motion.button
            key={index}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 border-t-2 px-4 py-4 text-sm font-medium transition-all duration-200',
              activeTab === index
                ? 'border-purple-600 text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300',
            )}
            onClick={() => setActiveTab(index)}
            whileHover={{ translateY: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="hidden sm:inline">{tab.icon}</span>
            <span>{tab.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Left column - Content */}
              <div className="w-full lg:w-1/2">
                <div className="mb-8 space-y-6">
                  <div className="flex items-start">
                    <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-800">
                      {tabs[activeTab].icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {tabs[activeTab].title}
                      </h3>
                      <p className="text-gray-400">
                        {tabs[activeTab].description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  {tabs[activeTab].features.map((feature, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start"
                      initial={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-800 text-white">
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
                      <span className="text-sm text-gray-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right column - Visual */}
              <div className="w-full lg:w-1/2">
                <motion.div
                  className="relative h-64 w-full rounded-xl bg-gray-900 p-6"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="text-center">
                      <div className="mb-4 text-5xl text-purple-500">
                        {tabs[activeTab].icon}
                      </div>
                      <h4 className="text-xl font-bold text-white">
                        {tabs[activeTab].name}
                      </h4>
                      <p className="mt-2 text-sm text-gray-400">
                        Explore our {tabs[activeTab].name.toLowerCase()} to
                        accelerate your learning
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Call to action */}
      <div className="border-t border-gray-800 p-6">
        <Link
          href="/roadmaps"
          className="group inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-3 text-lg font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
        >
          Explore Roadmaps
          <motion.div
            animate={{ translateX: [0, 5, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
            }}
          >
            <svg
              className="ml-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        </Link>
      </div>
    </div>
  );
};
