import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ctaLinks, companyInfo } from '@/constants';

const CTASection: React.FC = () => (
  <section className="relative z-10 bg-gradient-to-r from-gray-100 via-white to-gray-50 py-20 dark:from-[#1e293b] dark:via-[#232946] dark:to-[#18181b]">
    <div className="absolute inset-0 z-0 overflow-hidden opacity-20">
      <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-primary blur-3xl"></div>
      <div className="absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-primary2 blur-3xl"></div>
    </div>

    <div className="container relative z-10 mx-auto flex flex-col items-center justify-center px-4">
      <motion.h2
        className="mb-6 text-center text-4xl font-extrabold text-gray-900 dark:text-white md:text-5xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Ready to Transform Your <br />
        <span className="text-primary">Engineering Journey?</span>
      </motion.h2>
      <motion.p
        className="mx-auto mb-10 max-w-2xl text-center text-lg text-gray-600 dark:text-gray-300"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        Join thousands of engineering students who are already using{' '}
        {companyInfo.name}
        to accelerate their learning, prepare for placements, and build a
        successful career.
      </motion.p>
      <motion.div
        className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Link
          href={ctaLinks.getStarted.href}
          className="hover:shadow-primary/30 group relative inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-primary to-primary2 px-8 py-4 text-lg font-bold text-white transition-all duration-300 hover:shadow-lg"
        >
          <span className="relative z-10">{ctaLinks.getStarted.name}</span>
          <span className="absolute inset-0 z-0 bg-gradient-to-r from-primary2 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
        </Link>
        <Link
          href={ctaLinks.learnMore.href}
          className="flex items-center rounded-full border border-gray-300 bg-white/80 px-6 py-4 text-lg font-medium text-gray-700 backdrop-blur-sm transition-all duration-300 hover:border-gray-400 hover:bg-white/90 dark:border-gray-700/30 dark:bg-white/5 dark:text-white dark:hover:border-gray-600 dark:hover:bg-white/10"
        >
          {ctaLinks.learnMore.name}
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

export default CTASection;
