import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Testimonial from '@/components/TestimonialCard';

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
        <Testimonial
          name="Rahul Sharma"
          role="Computer Science, IIT Delhi"
          quote="EduScales helped me structure my learning journey and connect with like-minded peers. The roadmaps were exactly what I needed to prepare for placements."
          image="/images/testimonial1.jpg"
          delay={0.1}
        />
        <Testimonial
          name="Priya Patel"
          role="Electronics Engineering, BITS Pilani"
          quote="The community support is incredible! I got answers to my questions within minutes, and the company-specific preparation guides were invaluable for my interviews."
          image="/images/testimonial2.jpg"
          delay={0.3}
        />
        <Testimonial
          name="Arjun Mehta"
          role="Mechanical Engineering, NIT Trichy"
          quote="Battle Zone challenges pushed me to improve my problem-solving skills. I've earned several achievement badges that actually impressed recruiters during my interviews!"
          image="/images/testimonial3.jpg"
          delay={0.5}
        />
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
