'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

interface FloatingElementsProps {
  className?: string;
  count?: number;
  minSize?: number;
  maxSize?: number;
  colors?: string[];
  minDuration?: number;
  maxDuration?: number;
  shapes?: ('circle' | 'square' | 'triangle')[];
  opacityRange?: [number, number];
}

export const FloatingElements = ({
  className,
  count = 15,
  minSize = 10,
  maxSize = 60,
  colors = ['#8300b8', '#690091', '#8300b826', 'rgba(131, 0, 184, 0.1)'],
  minDuration = 15,
  maxDuration = 40,
  shapes = ['circle', 'square', 'triangle'],
  opacityRange = [0.1, 0.3],
}: FloatingElementsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = React.useState<FloatingElement[]>([]);

  useEffect(() => {
    // Only initialize elements once when the component mounts
    // or when the container size changes
    const initElements = () => {
      if (!containerRef.current) return;

      const { width, height } = containerRef.current.getBoundingClientRect();

      const newElements: FloatingElement[] = [];

      for (let i = 0; i < count; i++) {
        newElements.push({
          id: i,
          x: Math.random() * width,
          y: Math.random() * height,
          size: minSize + Math.random() * (maxSize - minSize),
          color: colors[Math.floor(Math.random() * colors.length)],
          duration: minDuration + Math.random() * (maxDuration - minDuration),
          delay: Math.random() * -20,
        });
      }

      setElements(newElements);
    };

    initElements();

    // Add resize listener to update elements when window size changes
    const handleResize = () => {
      initElements();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array - only run on mount

  const renderShape = (element: FloatingElement, index: number) => {
    const shape = shapes[index % shapes.length];
    const opacity =
      opacityRange[0] + Math.random() * (opacityRange[1] - opacityRange[0]);

    // Extract key from common props
    const elementKey = element.id;

    const commonProps = {
      initial: { translateX: element.x, translateY: element.y, opacity: 0 },
      animate: {
        translateX: [element.x, element.x + 50, element.x - 50, element.x],
        translateY: [
          element.y,
          element.y - 100,
          element.y - 200,
          element.y - 300,
        ],
        opacity: [0, opacity, opacity, 0],
        rotate: [0, 180, 360],
      },
      transition: {
        duration: element.duration,
        repeat: Infinity,
        delay: element.delay,
        ease: 'linear',
      },
      style: {
        position: 'absolute' as const,
        backgroundColor: element.color,
        width: element.size,
        height: element.size,
      },
    };

    switch (shape) {
      case 'circle':
        return (
          <motion.div
            key={elementKey}
            {...commonProps}
            className="rounded-full"
          />
        );
      case 'square':
        return (
          <motion.div
            key={elementKey}
            {...commonProps}
            className="rounded-md"
          />
        );
      case 'triangle':
        return (
          <motion.div
            key={elementKey}
            {...commonProps}
            className="triangle"
            style={{
              ...commonProps.style,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' as const,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 overflow-hidden', className)}
    >
      {elements.map((element, index) => renderShape(element, index))}
    </div>
  );
};
