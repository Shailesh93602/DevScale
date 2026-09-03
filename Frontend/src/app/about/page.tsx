'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Users, Target, Rocket, Code2 } from 'lucide-react';
import { BRANDING } from '@/constants';

// Honest product capabilities — EduScale is a new, solo-built platform, so
// this leads with what it does, not user counts it does not have (see QA: no
// fabricated social proof). The copy below is first person for the same
// reason: there is no "we", and a page that says "we" and then "one engineer"
// in the same scroll reads as either padding or a slip.
const stats = [
  { label: 'Battle Zones', value: 'Real-Time' },
  { label: 'Career Roadmaps', value: 'Adaptive' },
  { label: 'Code Runner', value: 'Sandboxed' },
  { label: 'Production Stack', value: 'Next · PG · Redis' },
];

const values = [
  {
    icon: <Target className="h-6 w-6" />,
    title: 'Mission Driven',
    description:
      'I built this to close the gap between what a degree teaches and what a first engineering job asks for.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Learn Against People',
    description:
      'Practice sticks when there is someone on the other side. Battles are head-to-head, and roadmaps carry comments from the people walking them.',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Battle Tested',
    description:
      'Timed, scored, live. The Battle Zone is closer to an interview than a tutorial is, and that is the point.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Trust & Integrity',
    description:
      'Structured roadmaps mapped to what the industry actually hires for, so you spend your time on the skills that matter.',
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
            {/* The gradient stops BEFORE the text does.
                `to-primary/80` ends at 80% opacity over a transparent fill, so
                by the time the run reaches "Education." there is barely any
                colour left — near-white on light, near-black on dark, and the
                final period effectively invisible in both. Ending on a fully
                opaque stop keeps the sweep and keeps the word readable. */}
            <span className="via-purple-500 bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
              Engineering Education.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            A learning platform for engineering students, built and run by one
            engineer. Competitive coding battles, structured roadmaps, and
            coding challenges in one place — a real product, still early, with
            its scale stated honestly.
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
              /* flex-col + mt-auto on the label.
                 "Next · PG · Redis" wraps to two lines while its three
                 neighbours stay on one, so its LABEL dropped a line below the
                 others and the row read as misaligned. Pushing the label to the
                 bottom of an equal-height cell keeps all four labels on the
                 same baseline whatever the value does. */
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex h-full flex-col text-center"
              >
                <div className="mb-2 text-4xl font-bold tracking-tighter text-foreground md:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-auto text-sm font-medium uppercase tracking-wider text-muted-foreground">
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
                {BRANDING.name} started from a frustration I had as a student
                and then saw again as an engineer: universities teach theory,
                and companies hire for practical skill. The distance between the
                two is where most graduates lose time.
              </p>
              <p>
                So I built something that works less like a tutorial and more
                like a{' '}
                <strong className="text-foreground">proving ground</strong>:
                roadmaps you actually progress through, real-time battles
                against another person, and challenges that grade your code. It
                is one person&apos;s project, not a company, and it is still
                growing.
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
                    Built by an engineer, for engineers.
                  </h3>
                  <p className="text-muted-foreground">
                    Every feature is tested against one question: does this make
                    the person using it more hirable?
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
              What I Optimise For
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              The principles behind every decision in the codebase.
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
              One engineer, one mission.
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              I&apos;m Shailesh Chaudhari, a backend engineer. I design, build,
              deploy and maintain {BRANDING.name} myself — the Next.js frontend,
              the Express and Socket.io backend, the Postgres schema and the
              Redis coordination underneath the battles. The source is public.
            </p>
            <a
              href="https://shaileshchaudhari.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-105"
            >
              Visit my portfolio
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
