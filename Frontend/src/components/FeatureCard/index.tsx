import React, { JSX } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FaArrowRight,
  FaCogs,
  FaUsers,
  FaBriefcase,
  FaGamepad,
  FaMedal,
  FaBook,
} from 'react-icons/fa';

// Enhanced feature card component with improved animations
const FeatureCard = ({
  icon,
  title,
  description,
  delay,
  href,
}: {
  readonly icon: JSX.Element | undefined;
  readonly title: string;
  readonly description: string;
  readonly delay: number;
  readonly href: string;
}) => {
  return (
    <motion.div
      className="from-[var(--primary)]/20 to-[var(--primary2)]/20 hover:from-[var(--primary)]/30 hover:to-[var(--primary2)]/30 group relative flex cursor-pointer flex-col items-center rounded-xl border border-border bg-card/80 bg-gradient-to-br p-8 shadow-lg backdrop-blur-md transition-shadow duration-300 hover:shadow-2xl"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03 }}
      onClick={() => href && (window.location.href = href)}
    >
      <Link href={href} className="absolute inset-0" aria-label={title}></Link>
      <div className="bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl text-primary">
        {icon ||
          (title === 'Personalized Roadmaps' ? (
            <FaCogs />
          ) : title === 'Active Community' ? (
            <FaUsers />
          ) : title === 'Placement Preparation' ? (
            <FaBriefcase />
          ) : title === 'Battle Zone' ? (
            <FaGamepad />
          ) : title === 'Achievements & Badges' ? (
            <FaMedal />
          ) : title === 'Curated Resources' ? (
            <FaBook />
          ) : (
            <FaCogs />
          ))}
      </div>
      <h3 className="mb-2 text-center text-xl font-bold text-foreground">
        {title}
      </h3>
      <p className="text-center text-muted-foreground">{description}</p>
      <motion.div
        className="mt-6 flex items-center text-[var(--primary)] transition-all duration-300 group-hover:text-[var(--primary2)]"
        initial={{ translateX: 0 }}
        whileHover={{ translateX: 5 }}
      >
        <span className="font-medium">Learn more</span>
        <motion.div
          animate={{ translateX: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <FaArrowRight className="ml-2" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default FeatureCard;
