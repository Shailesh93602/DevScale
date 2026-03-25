import React from 'react';
import { motion } from 'framer-motion';

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface RoadmapSectionProps {
  title: string;
  description: string;
  steps: RoadmapStep[];
}

const RoadmapSection: React.FC<RoadmapSectionProps> = ({
  title,
  description,
  steps,
}) => {
  return (
    <section id="roadmap" className="relative z-10 py-20">
      <motion.h2
        className="mb-6 text-center text-4xl font-extrabold text-primary md:text-5xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {title}
      </motion.h2>
      <motion.p
        className="mx-auto mb-12 max-w-2xl text-center text-lg text-muted-foreground"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {description}
      </motion.p>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, idx) => (
          <motion.div
            key={step.id}
            className="flex flex-col items-center rounded-xl border border-neutral-200 bg-white/80 p-8 shadow-lg backdrop-blur-md transition-shadow duration-300 hover:shadow-2xl dark:border-neutral-700 dark:bg-neutral-900/80"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
          >
            <div className="bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full text-primary">
              {step.icon}
            </div>
            <h3 className="mb-2 text-center text-xl font-bold text-foreground">
              {step.title}
            </h3>
            <p className="text-center text-muted-foreground">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RoadmapSection;
