'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HeroSection from '@/components/Landing/HeroSection';
import ModernStatsSection from '@/components/Landing/ModernStatsSection';
import CommunitySection from '@/components/Landing/CommunitySection';
import FeaturesSection from '@/components/Landing/FeaturesSection';
import RoadmapSection from '@/components/Landing/RoadmapSection';
import CTASection from '@/components/Landing/CTASection';
import SimpleWeeklyLeaderboard from '@/components/Landing/SimpleWeeklyLeaderboard';

// Import new animation components
import { AnimatedGradientBorder } from '@/components/ui/animated-gradient-border';
import { ThreeDCard } from '@/components/ui/3d-card';
import { FloatingElements } from '@/components/ui/floating-elements';
import { AnimatedBattleCard } from '@/components/ui/animated-battle-card';
import { MagneticButton } from '@/components/ui/magnetic-button';

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
    <div className="relative min-h-screen bg-background">
      {/* Animated background elements */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          className="bg-primary/20 absolute -top-1/2 left-0 h-[1000px] w-[1000px] rounded-full blur-3xl"
          animate={{
            translateX: [0, 100, 0],
            translateY: [0, 50, 0],
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
            translateX: [0, -100, 0],
            translateY: [0, -50, 0],
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
            translateX: [0, -50, 0],
            translateY: [0, 100, 0],
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
      <ModernStatsSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Community Section */}
      <CommunitySection />

      {/* Battle Zone Section */}
      <section className="relative z-10 overflow-hidden py-20">
        {/* Floating elements in background */}
        <FloatingElements
          className="absolute inset-0 z-0"
          count={10}
          minSize={20}
          maxSize={80}
          shapes={['circle', 'square']}
          opacityRange={[0.03, 0.08]}
        />

        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col items-center gap-16 lg:flex-row-reverse lg:items-start">
            <motion.div
              className="w-full lg:w-1/2"
              initial={{ opacity: 0, translateX: 50 }}
              whileInView={{ opacity: 1, translateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.h2
                className="mb-6 text-4xl font-extrabold text-primary md:text-5xl"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                Test Your Skills in Battle Zone
              </motion.h2>

              <ThreeDCard
                depth={20}
                layers={3}
                className="mb-8 p-6"
                rotationIntensity={5}
                glareIntensity={0.1}
                shadowIntensity={0.3}
              >
                <p className="text-lg text-foreground/90">
                  Challenge yourself with coding competitions, problem-solving
                  battles, and technical quizzes. Climb the leaderboard, earn
                  achievements, and showcase your expertise.
                </p>
              </ThreeDCard>

              <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatedBattleCard
                  title="Weekly Challenges"
                  description="New problems and competitions released every week to keep you engaged."
                  className="h-full"
                />

                <AnimatedBattleCard
                  title="Live Competitions"
                  description="Participate in real-time battles against peers to test your speed and accuracy."
                  className="h-full"
                />

                <AnimatedBattleCard
                  title="Difficulty Levels"
                  description="Challenges for every skill level, from beginner to advanced expert."
                  className="h-full"
                />
              </div>

              <MagneticButton
                href="/battle-zone"
                variant="primary"
                strength={20}
                className="group px-8 py-4 text-lg font-semibold"
              >
                Enter Battle Zone
                <motion.svg
                  className="ml-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  animate={{ translateX: [0, 5, 0] }}
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
              </MagneticButton>
            </motion.div>

            <motion.div
              className="relative w-full lg:w-1/2"
              initial={{ opacity: 0, translateX: -50 }}
              whileInView={{ opacity: 1, translateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Battle Zone visualization - Enhanced Leaderboard */}
              <AnimatedGradientBorder
                borderWidth={2}
                duration={8}
                borderRadius="1rem"
                gradientColors={['#8300b8', '#690091', '#8300b826', '#690091']}
                containerClassName="w-full"
              >
                <div className="relative w-full overflow-hidden rounded-2xl bg-[#1e293b] shadow-xl">
                  <SimpleWeeklyLeaderboard isEmbedded={true} />
                </div>
              </AnimatedGradientBorder>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <CTASection />

      {/* Scroll to top button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <motion.button
          onClick={scrollToTop}
          animate={{ translateY: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary2"
          whileHover={{ scale: 1.1 }}
          aria-label="Scroll to top"
          role="button"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 19V5M12 5l-6 6M12 5l6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  );
}
