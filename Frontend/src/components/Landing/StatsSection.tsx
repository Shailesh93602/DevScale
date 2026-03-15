import React from 'react';
import { motion } from 'framer-motion';
import { PlatformStatsShowcaseDark } from '@/components/ui/platform-stats-showcase-dark';

const StatsSection: React.FC = () => (
  <section className="relative z-10 py-16">
    <div className="container mx-auto px-4">
      {/* Full-width Platform Stats Showcase */}
      <motion.div
        className="relative w-full"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative w-full overflow-hidden rounded-xl shadow-xl">
          <PlatformStatsShowcaseDark className="h-full w-full" />
        </div>
      </motion.div>
    </div>
  </section>
);

export default StatsSection;
