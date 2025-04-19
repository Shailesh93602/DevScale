'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import HeroSection from '@/components/Landing/HeroSection';
import StatsSection from '@/components/Landing/StatsSection';
import CommunitySection from '@/components/Landing/CommunitySection';
import FeaturesSection from '@/components/Landing/FeaturesSection';
import FooterSection from '@/components/Landing/FooterSection';
import RoadmapSection from '@/components/Landing/RoadmapSection';
import CTASection from '@/components/Landing/CTASection';
import SimpleWeeklyLeaderboard from '@/components/Landing/SimpleWeeklyLeaderboard';

export default function Home() {
  // Enhanced parallax effect for hero section
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // Ref for scroll to top button
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="relative min-h-screen bg-background">
      {/* Animated background elements */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          className="bg-primary/20 absolute -top-1/2 left-0 h-[1000px] w-[1000px] rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="bg-primary2/20 absolute -bottom-1/4 right-0 h-[800px] w-[800px] rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="bg-primaryLight/40 absolute left-1/4 top-1/3 h-[600px] w-[600px] rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 100, 0],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            repeat: Infinity,
            duration: 18,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Hero Section */}
      <HeroSection
        heroY={heroY}
        heroOpacity={heroOpacity}
        heroScale={heroScale}
      />

      {/* Roadmap Visualization Section */}
      <RoadmapSection
        title="Your Engineering Roadmap"
        description="Visualize your learning journey, track your progress, and unlock new milestones as you advance through each step."
        steps={[
          {
            id: '1',
            title: 'Choose Your Path',
            description:
              'Select a personalized roadmap tailored to your engineering goals.',
            icon: (
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 8v4l3 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ),
          },
          {
            id: '2',
            title: 'Track Progress',
            description:
              'Monitor your advancement with interactive progress tracking and milestones.',
            icon: (
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M8 16l3-3 2 2 3-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ),
          },
          {
            id: '3',
            title: 'Unlock Achievements',
            description:
              'Earn badges and certificates as you complete key steps on your roadmap.',
            icon: (
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            ),
          },
        ]}
      />

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Community Section */}
      <CommunitySection />

      {/* Battle Zone Section */}
      <section className="relative z-10 overflow-hidden py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-16 lg:flex-row-reverse lg:items-start">
            <motion.div
              className="w-full lg:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-6 text-4xl font-extrabold text-primary md:text-5xl">
                Test Your Skills in Battle Zone
              </h2>
              <p className="mb-8 text-lg text-foreground/90">
                Challenge yourself with coding competitions, problem-solving
                battles, and technical quizzes. Climb the leaderboard, earn
                achievements, and showcase your expertise.
              </p>

              <div className="mb-8 space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary/20 mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-primary">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 15l-2-2h4l-2 2z" />
                      <path d="M10 7l2 2 2-2" />
                      <path d="M8 9l2 2-2 2" />
                      <path d="M16 9l-2 2 2 2" />
                      <path d="M19 6.873a2 2 0 011 1.747v6.536a2 2 0 01-1.029 1.748l-6 3.833a2 2 0 01-1.942 0l-6-3.833A2 2 0 014 15.157V8.62a2 2 0 011.029-1.748l6-3.572a2.056 2.056 0 012 0l6 3.573z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      Weekly Challenges
                    </h3>
                    <p className="text-foreground/60">
                      New problems and competitions released every week to keep
                      you engaged.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary2/20 mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-primary2">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                      <path d="M6 1v3M10 1v3M14 1v3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      Live Competitions
                    </h3>
                    <p className="text-foreground/60">
                      Participate in real-time battles against peers to test
                      your speed and accuracy.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primaryLight/50 mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-primary">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 15l-2-2h4l-2 2z" />
                      <path d="M10 7l2 2 2-2" />
                      <path d="M8 9l2 2-2 2" />
                      <path d="M16 9l-2 2 2 2" />
                      <path d="M19 6.873a2 2 0 011 1.747v6.536a2 2 0 01-1.029 1.748l-6 3.833a2 2 0 01-1.942 0l-6-3.833A2 2 0 014 15.157V8.62a2 2 0 011.029-1.748l6-3.572a2.056 2.056 0 012 0l6 3.573z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      Difficulty Levels
                    </h3>
                    <p className="text-foreground/60">
                      Challenges for every skill level, from beginner to
                      advanced expert.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/battle-zone"
                className="hover:shadow-primary/30 inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary2 px-6 py-3 text-lg font-semibold text-white transition-all duration-300 hover:shadow-lg"
              >
                Enter Battle Zone
                <motion.svg
                  className="ml-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: 'easeInOut',
                  }}
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </motion.svg>
              </Link>
            </motion.div>

            <motion.div
              className="relative w-full lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Battle Zone visualization - Enhanced Leaderboard */}
              <div className="relative w-full overflow-hidden rounded-2xl bg-[#1e293b] shadow-xl">
                <SimpleWeeklyLeaderboard isEmbedded={true} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <CTASection />

      {/* Footer */}
      <FooterSection />

      {/* Scroll to top button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="fixed bottom-8 right-8 z-50"
        onClick={scrollToTop}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-primary2"
          whileHover={{ scale: 1.1 }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 19V5M12 5l-6 6M12 5l6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </main>
  );
}
