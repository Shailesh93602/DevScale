import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import ParticlesBackground from '../AnimatedBackground/ParticlesBackground';

interface HeroSectionProps {
  heroY: MotionValue<number>;
  heroOpacity: MotionValue<number>;
  heroScale: MotionValue<number>;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  heroY,
  heroOpacity,
  heroScale,
}) => (
  <motion.section
    className="relative flex flex-col overflow-hidden px-4 pt-10 text-center"
    style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
  >
    {/* Modern interactive particles background */}
    <div className="absolute inset-0 z-0">
      <ParticlesBackground />
    </div>

    <div className="container relative z-10 mx-auto max-w-6xl">
      <motion.h1
        initial={{ translateY: 30, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mb-6 text-5xl font-extrabold tracking-tight text-primary md:text-7xl"
      >
        Your Engineering Journey <br className="hidden md:block" />
        <span className="text-foreground">Starts Here</span>
      </motion.h1>

      <motion.p
        initial={{ translateY: 30, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mx-auto mb-10 max-w-3xl text-lg text-foreground/90 md:text-xl"
      >
        EduScale is the all-in-one platform for engineering students.
        Personalized roadmaps, community support, placement preparation, and
        interactive challenges—all designed to transform your learning
        experience.
      </motion.p>

      <motion.div
        initial={{ translateY: 30, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="flex flex-col items-center justify-center gap-4 sm:flex-row"
      >
        <Link
          href="/signup"
          className="hover:shadow-primary/30 group relative inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-primary via-primary to-primary2 px-8 py-4 text-lg font-bold text-white transition-all duration-300 hover:shadow-xl"
        >
          <span className="relative z-10">Get Started Free</span>
          <motion.span
            className="from-primary/80 absolute inset-0 z-0 bg-gradient-to-r via-primary to-primary2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            initial={{ scale: 0.85 }}
            whileHover={{ scale: 1 }}
          ></motion.span>
        </Link>
        <Link
          href="#features"
          className="flex items-center rounded-full border border-foreground/20 bg-foreground/10 px-6 py-4 text-lg font-medium text-foreground backdrop-blur-sm transition-all duration-300 hover:border-foreground/30 hover:bg-foreground/15"
        >
          Explore Features
          <motion.span
            animate={{ translateX: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="ml-2 text-primary"
          >
            <FaArrowRight />
          </motion.span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground"
      >
        <p className="text-sm font-medium uppercase tracking-wider text-foreground/80">
          Trusted by students from
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <span className="text-lg font-semibold text-foreground/90">
            IIT Delhi
          </span>
          <span className="text-lg font-semibold text-foreground/90">
            NIT Trichy
          </span>
          <span className="text-lg font-semibold text-foreground/90">
            BITS Pilani
          </span>
          <span className="text-lg font-semibold text-foreground/90">
            VIT Vellore
          </span>
          <span className="text-lg font-semibold text-foreground/90">
            + 100 more
          </span>
        </div>
      </motion.div>
    </div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 1.2 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2"
    >
      <motion.div
        animate={{ translateY: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-sm"
        whileHover={{ scale: 1.1 }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14m0 0l-6-6m6 6l6-6"
            stroke="currentColor"
            className="text-primary"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.div>
  </motion.section>
);

export default HeroSection;
