'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedGradientBorderProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  duration?: number;
  borderWidth?: number;
  gradientColors?: string[];
  animate?: boolean;
  borderRadius?: string;
}

export const AnimatedGradientBorder = ({
  children,
  className,
  containerClassName,
  duration = 8,
  borderWidth = 2,
  gradientColors = ['#8300b8', '#690091', '#8300b826'],
  animate = true,
  borderRadius = '1rem',
}: AnimatedGradientBorderProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn('relative', containerClassName)}
      style={{ borderRadius }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="absolute inset-0 z-0 rounded-[inherit]"
        style={{
          background: `linear-gradient(to right, ${gradientColors.join(', ')})`,
          backgroundSize: '300% 300%',
        }}
        animate={
          animate || hovered
            ? {
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }
            : {}
        }
        transition={{
          duration,
          ease: 'linear',
          repeat: Infinity,
        }}
      />
      <div
        className={cn(
          'relative z-10 rounded-[inherit] bg-background',
          className,
        )}
        style={{
          margin: borderWidth,
        }}
      >
        {children}
      </div>
    </div>
  );
};
