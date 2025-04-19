import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="bg-primary/20 absolute -top-1/2 left-0 h-[1000px] w-[1000px] rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="bg-primary2/20 absolute -bottom-1/4 right-0 h-[800px] w-[800px] rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 15,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="bg-primaryLight/40 absolute left-1/4 top-1/3 h-[600px] w-[600px] rounded-full blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 100, 0],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
