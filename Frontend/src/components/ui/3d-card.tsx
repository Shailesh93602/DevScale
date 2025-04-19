'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  depth?: number;
  layers?: number;
  rotationIntensity?: number;
  shadowIntensity?: number;
  glareIntensity?: number;
  backgroundGradient?: string;
  borderRadius?: string;
}

export const ThreeDCard = ({
  children,
  className,
  containerClassName,
  depth = 30,
  layers = 5,
  rotationIntensity = 15,
  shadowIntensity = 0.5,
  glareIntensity = 0.2,
  backgroundGradient = 'linear-gradient(145deg, rgba(131, 0, 184, 0.05), rgba(105, 0, 145, 0.1))',
  borderRadius = '1rem',
}: ThreeDCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const damping = 50;
  const springX = useSpring(mouseX, { damping });
  const springY = useSpring(mouseY, { damping });

  const rotateX = useTransform(
    springY,
    [0, dimensions.height],
    [rotationIntensity, -rotationIntensity],
  );
  const rotateY = useTransform(
    springX,
    [0, dimensions.width],
    [-rotationIntensity, rotationIntensity],
  );

  const glareX = useTransform(springX, [0, dimensions.width], [-100, 100]);
  const glareY = useTransform(springY, [0, dimensions.height], [-100, 100]);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(dimensions.width / 2);
    mouseY.set(dimensions.height / 2);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsTouching(true);
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
    mouseX.set(dimensions.width / 2);
    mouseY.set(dimensions.height / 2);
  };

  // Generate layers for 3D effect
  const renderLayers = () => {
    const layerElements = [];

    for (let i = 0; i < layers; i++) {
      const layerDepth = depth * (i / layers);

      layerElements.push(
        <motion.div
          key={i}
          className="absolute inset-0 rounded-[inherit]"
          style={{
            zIndex: layers - i,
            transform: `translateZ(${-layerDepth}px)`,
            opacity: 1 - (i / layers) * 0.5,
          }}
        >
          {i === 0 && children}
        </motion.div>,
      );
    }

    return layerElements;
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative', containerClassName)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div
        className={cn('relative overflow-hidden', className)}
        style={{
          transformStyle: 'preserve-3d',
          transformPerspective: '1000px',
          borderRadius,
          boxShadow:
            isHovered || isTouching
              ? `0 50px 100px -20px rgba(0, 0, 0, ${shadowIntensity})`
              : `0 20px 40px -10px rgba(0, 0, 0, ${shadowIntensity / 2})`,
          background: backgroundGradient,
          transition: 'box-shadow 0.3s ease',
          rotateX: isHovered || isTouching ? rotateX : 0,
          rotateY: isHovered || isTouching ? rotateY : 0,
        }}
      >
        {renderLayers()}

        {/* Glare effect */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
          style={{
            background:
              'linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)',
            opacity: isHovered || isTouching ? glareIntensity : 0,
            mixBlendMode: 'overlay',
            left: isHovered || isTouching ? glareX : 0,
            top: isHovered || isTouching ? glareY : 0,
          }}
        />
      </motion.div>
    </div>
  );
};
