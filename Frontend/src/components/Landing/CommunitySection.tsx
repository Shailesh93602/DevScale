import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Testimonial from '@/components/TestimonialCard';
import { BRANDING } from '@/constants';

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
          Join Our Thriving Community
        </h2>
        <p className="mx-auto max-w-3xl text-lg text-foreground/90">
          Connect with fellow engineering students, share knowledge, and grow
          together in our supportive community.
        </p>
      </motion.div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {BRANDING.testimonials.map((testimonial, index) => (
          <Testimonial
            key={testimonial.name}
            name={testimonial.name}
            role={testimonial.role}
            quote={testimonial.quote}
            image={testimonial.image}
            delay={0.1 * (index * 2 + 1)}
          />
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-16 flex justify-center"
      >
        <Link
          href="/community"
          className="hover:shadow-primary/30 inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary2 px-6 py-3 text-lg font-semibold text-white transition-all duration-300 hover:shadow-lg"
        >
          Join the Community
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
