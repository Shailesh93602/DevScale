'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Users, Target, Rocket, Code2 } from 'lucide-react';
import { BRANDING } from '@/constants';

const stats = [
  { label: 'Active Students', value: '10,000+' },
  { label: 'Coding Challenges', value: '500+' },
  { label: 'Success Rate', value: '92%' },
  { label: 'Community Members', value: '25,000+' },
];

const values = [
  {
    icon: <Target className="h-6 w-6" />,
    title: 'Mission Driven',
    description:
      'We exist to close the gap between theoretical graduation and practical industry readiness.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Community First',
    description:
      'Learning is collaborative. Our community is built to lift each other up through peer programming.',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Battle Tested',
    description:
      'We simulate real-world interviews and competitive challenges to ensure students are over-prepared.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Trust & Integrity',
    description:
      'Standardized roadmaps curated by FAANG engineers to guarantee you are learning what actually matters.',
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function About() {
  return (
    <main className="selection:bg-primary/30 min-h-screen overflow-hidden bg-background">
      {/* Hero Section */}
      <section className="relative px-6 pb-20 pt-32 lg:pb-32 lg:pt-48">
        <div className="from-primary/10 absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] via-background to-background opacity-80" />

        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="border-primary/20 bg-primary/5 mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-sm font-medium tracking-wide text-primary">
                About {BRANDING.name}
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8 text-5xl font-bold leading-[1.1] tracking-tight text-foreground md:text-7xl"
          >
            Redefining <br className="hidden md:block" />
            <span className="via-purple-500 to-primary/80 bg-gradient-to-r from-primary bg-clip-text text-transparent">
              Engineering Education.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            We're building the infrastructure for the next generation of
            engineers. Combining competitive coding, structured roadmaps, and a
            powerful community into one seamless platform.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/40 bg-accent/20 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-4"
          >
            {stats.map((stat, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center">
                <div className="mb-2 text-4xl font-bold tracking-tighter text-foreground md:text-5xl">
                  {stat.value}
                </div>
                <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative px-6 py-24 lg:py-32">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 lg:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-8"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              The gap between theory <br /> and practice is too large.
            </h2>
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                {BRANDING.name} was born from a fundamental frustration:
                universities teach theory, but companies hire for practical
                skill. Millions of engineering students graduate every year
                unprepared for the realities of modern software development.
              </p>
              <p>
                We set out to build a platform that doesn't just act as a
                tutorial, but as a{' '}
                <strong className="text-foreground">proving ground</strong>.
                Through interactive roadmaps, real-time Battle Zones, and
                continuous feedback loops, we ensure that learning is an active,
                aggressive pursuit of mastery.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full flex-1"
          >
            <div className="glass group relative overflow-hidden rounded-3xl border border-border/50 p-8">
              <div className="from-primary/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-50 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl text-primary">
                  <Code2 className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">
                    Built by Engineers, for Engineers.
                  </h3>
                  <p className="text-muted-foreground">
                    Every feature we build is tested against a single metric:
                    Does this make our students more hirable?
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="border-t border-border/30 bg-card/50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              Our Core Values
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              The principles that guide our development and shape our community.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {values.map((value, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="hover:border-primary/30 group rounded-3xl border border-border/50 bg-background p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="bg-primary/5 mb-6 flex h-12 w-12 items-center justify-center rounded-xl text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {value.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Origin Section */}
      <section className="px-6 py-24 text-center">
        <div className="glass relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/50 p-12 shadow-sm">
          <div className="bg-primary/20 absolute -right-24 -top-24 h-48 w-48 rounded-full blur-3xl" />
          <div className="bg-purple-500/20 absolute -bottom-24 -left-24 h-48 w-48 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col items-center">
            <Rocket className="mb-6 h-12 w-12 text-primary" />
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
              Built by Shailesh Chaudhari
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              {BRANDING.name} is a personal project built by Shailesh Chaudhari, a
              Software Engineer dedicated to pushing the boundaries of what specialized SaaS
              platforms can achieve in the EdTech space.
            </p>
            <a
              href="https://shaileshchaudhari.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-105"
            >
              Visit My Portfolio
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
