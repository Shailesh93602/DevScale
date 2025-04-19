import React, { useEffect, useState, useRef, JSX } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

// Enhanced stats counter component with improved animations
const CountUp = ({
  end,
  duration = 2,
  label,
  icon,
}: {
  readonly end: number;
  readonly duration?: number;
  readonly label: string;
  readonly icon: JSX.Element | undefined;
}) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(nodeRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
      let startTime: number;
      let animationFrame: number;

      const countUp = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min(
          (timestamp - startTime) / (duration * 1000),
          1,
        );
        setCount(Math.floor(progress * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(countUp);
        }
      };

      animationFrame = requestAnimationFrame(countUp);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isInView, end, duration, controls]);

  return (
    <motion.div
      ref={nodeRef}
      className="flex flex-col items-center"
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.9 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.5,
            type: 'spring',
            stiffness: 100,
          },
        },
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary2)] text-white shadow-lg"
        initial={{ rotate: 0 }}
        animate={{ rotate: isInView ? 360 : 0 }}
        transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
      >
        {icon}
      </motion.div>
      <h3 className="text-4xl font-bold text-foreground">
        {count.toLocaleString()}+
      </h3>
      <p className="font-medium text-muted-foreground">{label}</p>
    </motion.div>
  );
};

export default CountUp;
