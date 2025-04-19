'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children?: React.ReactNode;
}

export const AnimatedFeatureCard = ({
  title,
  description,
  icon,
  className,
  contentClassName,
  children,
}: AnimatedFeatureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Motion values for the card
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Transform values for the shine effect
  const shineX = useTransform(
    rotateY,
    [-15, 15],
    [dimensions.width * -1.5, dimensions.width * 1.5],
  );
  const shineY = useTransform(
    rotateX,
    [-15, 15],
    [dimensions.height * 1.5, dimensions.height * -1.5],
  );

  // Update dimensions when the component mounts
  useEffect(() => {
    if (cardRef.current) {
      setDimensions({
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      });
    }
  }, []);

  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Calculate rotation based on mouse position
    const rotateXVal = (mouseY / (rect.height / 2)) * -7;
    const rotateYVal = (mouseX / (rect.width / 2)) * 7;

    rotateX.set(rotateXVal);
    rotateY.set(rotateYVal);

    setMousePosition({ x: mouseX, y: mouseY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-xl bg-gradient-to-br from-card/80 to-card p-1 shadow-lg',
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated border gradient */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-70"
        style={{
          background:
            'linear-gradient(45deg, var(--primary), var(--primary2), var(--primary-light), var(--primary2))',
          backgroundSize: '400% 400%',
          zIndex: 0,
        }}
        animate={{
          backgroundPosition: isHovered
            ? ['0% 0%', '100% 100%']
            : ['0% 0%', '0% 0%'],
        }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
      />

      {/* Card content with 3D effect */}
      <motion.div
        className={cn(
          'relative z-10 flex h-full flex-col items-center justify-center overflow-hidden rounded-lg bg-card p-6 text-center',
          contentClassName,
        )}
        style={{
          transformStyle: 'preserve-3d',
          rotateX,
          rotateY,
        }}
      >
        {/* Shine effect */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 rounded-lg"
          style={{
            background:
              'linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
            opacity: isHovered ? 1 : 0,
            left: shineX,
            top: shineY,
          }}
        />

        {/* Icon with floating effect */}
        <motion.div
          className="mb-6 text-primary"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(40px)',
          }}
        >
          {icon}
        </motion.div>

        {/* Title with floating effect */}
        <motion.h3
          className="mb-2 text-xl font-bold"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(30px)',
          }}
        >
          {title}
        </motion.h3>

        {/* Description with floating effect */}
        <motion.p
          className="text-muted-foreground"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(20px)',
          }}
        >
          {description}
        </motion.p>

        {/* Additional content */}
        {children && (
          <motion.div
            className="mt-4"
            style={{
              transformStyle: 'preserve-3d',
              transform: 'translateZ(50px)',
            }}
          >
            {children}
          </motion.div>
        )}

        {/* Floating particles */}
        <AnimatePresence>
          {isHovered && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-primary/30 pointer-events-none absolute h-2 w-2 rounded-full"
                  initial={{
                    translateX: mousePosition.x,
                    translateY: mousePosition.y,
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    translateX: mousePosition.x + (Math.random() - 0.5) * 100,
                    translateY: mousePosition.y + (Math.random() - 0.5) * 100,
                    opacity: [0, 0.5, 0],
                    scale: [0, 1.5, 0],
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1 + Math.random() }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
