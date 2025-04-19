import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaUsers, FaRoad, FaLaptopCode } from 'react-icons/fa';
import CountUp from '@/components/CountUp';

const StatsSection: React.FC = () => (
  <section className="relative z-10 py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        <CountUp
          end={10000}
          label="Active Users"
          icon={<FaUsers size={24} />}
        />
        <CountUp end={50} label="Roadmaps" icon={<FaRoad size={24} />} />
        <CountUp
          end={200}
          label="Company Guides"
          icon={<FaLaptopCode size={24} />}
        />
        <CountUp
          end={100}
          label="Achievements"
          icon={<FaLaptopCode size={24} />}
        />
      </div>
      <div className="mt-16 flex flex-col gap-8 lg:flex-row">
        <motion.div
          className="relative w-full lg:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8 space-y-4">
            <div className="flex items-start">
              <div className="bg-primary/30 mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-primary">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Choose Your Path
                </h3>
                <p className="text-foreground/80">
                  Select from curated roadmaps or create your own custom
                  learning journey.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary2/30 mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-primary">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Track Progress
                </h3>
                <p className="text-foreground/80">
                  Monitor your advancement with visual indicators and completion
                  metrics.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary/30 mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-primary">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Earn Achievements
                </h3>
                <p className="text-foreground/80">
                  Unlock badges and certificates as you master new skills and
                  concepts.
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/roadmaps"
            className="hover:shadow-primary/30 group inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary2 px-6 py-3 text-lg font-semibold text-white transition-all duration-300 hover:shadow-lg"
          >
            Explore Roadmaps
            <motion.div
              animate={{ x: [0, 5, 0] }}
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
        </motion.div>
        <motion.div
          className="relative flex w-full items-center justify-center lg:w-1/2"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Modern tech/learning illustration (SVG) - visually appealing and on-theme */}
          <div className="relative flex h-[350px] w-full items-center justify-center">
            <svg
              width="340"
              height="340"
              viewBox="0 0 340 340"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="340"
                height="340"
                rx="32"
                fill="url(#paint0_linear)"
              />
              <g filter="url(#shadow)">
                <ellipse
                  cx="170"
                  cy="250"
                  rx="90"
                  ry="24"
                  fill="#000"
                  fillOpacity="0.07"
                />
              </g>
              <g>
                <rect
                  x="90"
                  y="110"
                  width="160"
                  height="90"
                  rx="16"
                  fill="#fff"
                  className="dark:fill-neutral-900"
                />
                <rect
                  x="110"
                  y="130"
                  width="120"
                  height="14"
                  rx="7"
                  fill="#e0e7ef"
                  className="dark:fill-neutral-800"
                />
                <rect
                  x="110"
                  y="155"
                  width="80"
                  height="10"
                  rx="5"
                  fill="#e0e7ef"
                  className="dark:fill-neutral-800"
                />
                <rect
                  x="110"
                  y="175"
                  width="60"
                  height="10"
                  rx="5"
                  fill="#e0e7ef"
                  className="dark:fill-neutral-800"
                />
                <rect
                  x="200"
                  y="175"
                  width="30"
                  height="10"
                  rx="5"
                  fill="#c7d2fe"
                  className="dark:fill-primary/60"
                />
                <circle
                  cx="130"
                  cy="200"
                  r="10"
                  fill="#6366f1"
                  className="dark:fill-primary2"
                />
                <rect
                  x="150"
                  y="195"
                  width="60"
                  height="10"
                  rx="5"
                  fill="#e0e7ef"
                  className="dark:fill-neutral-800"
                />
                <rect
                  x="220"
                  y="195"
                  width="10"
                  height="10"
                  rx="5"
                  fill="#a5b4fc"
                  className="dark:fill-primary/40"
                />
                <rect
                  x="170"
                  y="110"
                  width="40"
                  height="-10"
                  rx="5"
                  fill="#6366f1"
                  className="dark:fill-primary2"
                />
                <rect
                  x="190"
                  y="105"
                  width="20"
                  height="10"
                  rx="5"
                  fill="#a5b4fc"
                  className="dark:fill-primary/40"
                />
              </g>
              <g>
                <circle
                  cx="120"
                  cy="90"
                  r="18"
                  fill="#6366f1"
                  className="dark:fill-primary2"
                />
                <rect x="110" y="80" width="20" height="6" rx="3" fill="#fff" />
                <rect x="110" y="92" width="20" height="4" rx="2" fill="#fff" />
              </g>
              <g>
                <rect
                  x="220"
                  y="90"
                  width="40"
                  height="14"
                  rx="7"
                  fill="#a5b4fc"
                  className="dark:fill-primary/40"
                />
                <rect
                  x="230"
                  y="100"
                  width="20"
                  height="6"
                  rx="3"
                  fill="#fff"
                />
              </g>
              <defs>
                <linearGradient
                  id="paint0_linear"
                  x1="0"
                  y1="0"
                  x2="340"
                  y2="340"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#f5f7fa" />
                  <stop offset="1" stopColor="#e0e7ef" />
                </linearGradient>
                <filter
                  id="shadow"
                  x="70"
                  y="226"
                  width="200"
                  height="48"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feGaussianBlur
                    stdDeviation="5"
                    result="effect1_foregroundBlur"
                  />
                </filter>
              </defs>
            </svg>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default StatsSection;
