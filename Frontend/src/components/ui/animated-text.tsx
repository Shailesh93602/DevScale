'use client';

import React, { useState, useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  text: string;
  className?: string;
  once?: boolean;
  repeatDelay?: number;
  animation?: 'typewriter' | 'wave' | 'bounce' | 'fade' | 'slide';
  highlightColor?: string;
  highlightWords?: string[];
}

export const AnimatedText = ({
  text,
  className,
  once = true,
  repeatDelay = 5,
  animation = 'wave',
  highlightColor = '#8300b8',
  highlightWords = [],
}: AnimatedTextProps) => {
  const controls = useAnimation();
  const [key, setKey] = useState(0);
  const words = text.split(' ');

  // Variants for container of words
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  // Variants for typewriter effect
  const typewriterVariants: Variants = {
    hidden: { width: 0, opacity: 0 },
    visible: {
      width: '100%',
      opacity: 1,
      transition: {
        width: { duration: 0.5, ease: 'easeInOut' },
        opacity: { duration: 0.2, ease: 'easeIn' },
      },
    },
  };

  // Variants for wave effect
  const waveVariants: Variants = {
    hidden: { translateY: 0 },
    visible: (i = 1) => ({
      translateY: [0, -15, 0],
      transition: {
        delay: 0.05 * i,
        duration: 0.5,
        ease: 'easeInOut',
        times: [0, 0.5, 1],
      },
    }),
  };

  // Variants for bounce effect
  const bounceVariants: Variants = {
    hidden: { scale: 1 },
    visible: (i = 1) => ({
      scale: [1, 1.2, 1],
      transition: {
        delay: 0.05 * i,
        duration: 0.4,
        ease: 'easeInOut',
        times: [0, 0.5, 1],
      },
    }),
  };

  // Variants for fade effect
  const fadeVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: {
        delay: 0.05 * i,
        duration: 0.5,
        ease: 'easeInOut',
      },
    }),
  };

  // Variants for slide effect
  const slideVariants: Variants = {
    hidden: { translateX: -20, opacity: 0 },
    visible: (i = 1) => ({
      translateX: 0,
      opacity: 1,
      transition: {
        delay: 0.05 * i,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  const getVariants = () => {
    switch (animation) {
      case 'typewriter':
        return typewriterVariants;
      case 'wave':
        return waveVariants;
      case 'bounce':
        return bounceVariants;
      case 'fade':
        return fadeVariants;
      case 'slide':
        return slideVariants;
      default:
        return waveVariants;
    }
  };

  useEffect(() => {
    const animate = async () => {
      await controls.start('visible');

      if (!once) {
        setTimeout(() => {
          controls.start('hidden').then(() => {
            setKey((prev) => prev + 1);
          });
        }, repeatDelay * 1000);
      }
    };

    animate();
  }, [controls, once, repeatDelay, key]);

  if (animation === 'typewriter') {
    return (
      <div className={cn('overflow-hidden', className)}>
        <motion.div
          key={key}
          variants={typewriterVariants}
          initial="hidden"
          animate={controls}
          className="inline-block whitespace-nowrap"
        >
          {text}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      key={key}
      className={cn('inline-flex flex-wrap', className)}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
    >
      {words.map((word, i) => {
        const isHighlighted = highlightWords.includes(word);

        return (
          <motion.span
            key={i}
            custom={i}
            variants={getVariants()}
            className="mr-1 inline-block"
            style={isHighlighted ? { color: highlightColor } : {}}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.div>
  );
};
