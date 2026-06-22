import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaBolt, FaRoad, FaLaptopCode } from 'react-icons/fa';
import { BRANDING } from '@/constants';

// Map the icon name stored in branding constants to its component.
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FaBolt,
  FaRoad,
  FaLaptopCode,
};

const CommunitySection: React.FC = () => (
  <section className="relative z-10 py-20">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16 text-center"
      >
        <h2 className="mb-4 text-4xl font-extrabold text-primary md:text-5xl">
          Built for Engineers Who Practice
        </h2>
        <p className="mx-auto max-w-3xl text-lg text-foreground/90">
          Learn by doing — compete in live battles, follow structured roadmaps,
          and run real code with instant feedback.
        </p>
      </motion.div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {BRANDING.communityHighlights.map((highlight, index) => {
          const Icon = ICONS[highlight.icon] ?? FaBolt;
          return (
            <motion.div
              key={highlight.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="bg-primary/10 mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {highlight.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {highlight.description}
              </p>
            </motion.div>
          );
        })}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-16 flex justify-center"
      >
        <Link
          href="/auth/register"
          className="hover:shadow-primary/30 inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary2 px-6 py-3 text-lg font-semibold text-white transition-all duration-300 hover:shadow-lg"
        >
          Get Started
          <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </motion.div>
    </div>
  </section>
);

export default CommunitySection;
