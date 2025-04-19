'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glareEnabled?: boolean;
  tiltMaxAngleX?: number;
  tiltMaxAngleY?: number;
  perspective?: number;
  scale?: number;
  glareOpacity?: number;
  borderRadius?: string;
  transitionDuration?: number;
  transitionEasing?: string;
}

export const TiltCard = ({
  children,
  className,
  glareEnabled = true,
  tiltMaxAngleX = 10,
  tiltMaxAngleY = 10,
  perspective = 1000,
  scale = 1.05,
  glareOpacity = 0.2,
  borderRadius = '1rem',
  transitionDuration = 0.2,
  transitionEasing = 'cubic-bezier(0.03, 0.98, 0.52, 0.99)',
}: TiltCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(
    y,
    [-dimensions.height / 2, dimensions.height / 2],
    [tiltMaxAngleX, -tiltMaxAngleX],
  );
  const rotateY = useTransform(
    x,
    [-dimensions.width / 2, dimensions.width / 2],
    [-tiltMaxAngleY, tiltMaxAngleY],
  );

  const springConfig = { damping: 20, stiffness: 300 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  useEffect(() => {
    if (cardRef.current) {
      setDimensions({
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      });
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsTouching(true);
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set(e.touches[0].clientX - centerX);
    y.set(e.touches[0].clientY - centerY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set(e.touches[0].clientX - centerX);
    y.set(e.touches[0].clientY - centerY);
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn('relative overflow-hidden', className)}
      style={{
        perspective,
        borderRadius,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      animate={{
        scale: isHovered || isTouching ? scale : 1,
      }}
      transition={{
        duration: transitionDuration,
        ease: transitionEasing,
      }}
    >
      <motion.div
        className="absolute inset-0 z-10 h-full w-full"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </motion.div>

      {glareEnabled && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 h-full w-full rounded-[inherit]"
          style={{
            background:
              'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
            opacity: 0,
            mixBlendMode: 'overlay',
          }}
          animate={{
            opacity: isHovered || isTouching ? glareOpacity : 0,
            rotateZ: isHovered || isTouching ? 45 : 0,
          }}
          transition={{
            duration: transitionDuration,
            ease: transitionEasing,
          }}
        />
      )}
    </motion.div>
  );
};
