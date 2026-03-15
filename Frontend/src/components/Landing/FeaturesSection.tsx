import React from 'react';
import { motion } from 'framer-motion';
import FeatureCard from '@/components/FeatureCard';
import Image from 'next/image';
import {
  FaCogs,
  FaUsers,
  FaBriefcase,
  FaGamepad,
  FaMedal,
  FaBook,
} from 'react-icons/fa';

const FeaturesSection: React.FC = () => (
  <section id="features" className="relative z-10 py-20">
    <div className="container mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center text-4xl font-extrabold text-primary md:text-5xl"
      >
        Everything You Need In One Place
      </motion.h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <Image
                src="/icons/roadmap.svg"
                alt="Personalized Roadmaps"
                width={48}
                height={48}
                className="feature-image"
                priority
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (
                    e.target as HTMLElement
                  ).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <FaCogs className="hidden text-4xl text-primary" />
            </span>
          }
          title="Personalized Roadmaps"
          description="Tailored learning paths to help you reach your engineering goals."
          delay={0.1}
          href="/roadmaps"
        />
        <FeatureCard
          icon={
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <Image
                src="/icons/community.svg"
                alt="Active Community"
                width={48}
                height={48}
                className="feature-image"
                priority
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (
                    e.target as HTMLElement
                  ).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <FaUsers className="hidden text-4xl text-primary" />
            </span>
          }
          title="Active Community"
          description="Connect, collaborate, and grow with fellow students."
          delay={0.2}
          href="/community"
        />
        <FeatureCard
          icon={
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <Image
                src="/icons/interview.svg"
                alt="Placement Preparation"
                width={48}
                height={48}
                className="feature-image"
                priority
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (
                    e.target as HTMLElement
                  ).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <FaBriefcase className="hidden text-4xl text-primary" />
            </span>
          }
          title="Placement Preparation"
          description="Company-specific guides, interview questions, and tips."
          delay={0.3}
          href="/interview-prep"
        />
        <FeatureCard
          icon={
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <Image
                src="/icons/battle.svg"
                alt="Battle Zone"
                width={48}
                height={48}
                className="feature-image"
                priority
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (
                    e.target as HTMLElement
                  ).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <FaGamepad className="hidden text-4xl text-primary" />
            </span>
          }
          title="Battle Zone"
          description="Compete in coding challenges and climb the leaderboard."
          delay={0.4}
          href="/battle-zone"
        />
        <FeatureCard
          icon={
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <Image
                src="/icons/achievement.svg"
                alt="Achievements & Badges"
                width={48}
                height={48}
                className="feature-image"
                priority
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (
                    e.target as HTMLElement
                  ).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <FaMedal className="hidden text-4xl text-primary" />
            </span>
          }
          title="Achievements & Badges"
          description="Earn badges and certificates for your progress."
          delay={0.5}
          href="/achievements"
        />
        <FeatureCard
          icon={
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <Image
                src="/icons/resources.svg"
                alt="Curated Resources"
                width={48}
                height={48}
                className="feature-image"
                priority
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (
                    e.target as HTMLElement
                  ).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <FaBook className="hidden text-4xl text-primary" />
            </span>
          }
          title="Curated Resources"
          description="Access tutorials, blogs, and FAQs for every topic."
          delay={0.6}
          href="/resources"
        />
      </div>
    </div>
  </section>
);

export default FeaturesSection;
