'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  strength?: number;
  radius?: number;
  as?: 'button' | 'div' | 'a';
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'primary';
}

export const MagneticButton = ({
  children,
  className,
  href,
  onClick,
  strength = 40,
  radius = 400,
  disabled = false,
  variant = 'default',
}: MagneticButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring animations for smoother movement
  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Transform spring values to actual movement
  const moveX = useTransform(springX, [-radius, radius], [-strength, strength]);
  const moveY = useTransform(springY, [-radius, radius], [-strength, strength]);

  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const { clientX, clientY } = e;
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    // Calculate distance from center
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // Only activate if within radius
    if (distance < radius) {
      setActive(true);
      mouseX.set(distanceX);
      mouseY.set(distanceY);
    } else {
      setActive(false);
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  const handleMouseLeave = () => {
    setActive(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  // Get variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border border-primary bg-transparent text-primary hover:bg-primary/10';
      case 'ghost':
        return 'bg-transparent text-foreground hover:bg-foreground/10';
      case 'primary':
        return 'bg-primary text-white hover:bg-primary/90';
      default:
        return 'bg-card text-card-foreground hover:bg-muted';
    }
  };

  // Render the button with the appropriate element
  const renderButton = () => {
    const buttonContent = (
      <motion.div
        ref={buttonRef}
        className={cn(
          'relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full px-6 py-3 font-medium transition-colors',
          getVariantClasses(),
          disabled && 'pointer-events-none opacity-50',
          className,
        )}
        style={{
          translateX: active ? moveX : 0,
          translateY: active ? moveY : 0,
        }}
        whileTap={{ scale: 0.95 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {/* Magnetic pull effect */}
        <motion.span
          className="bg-primary/5 absolute inset-0 rounded-full"
          style={{
            scale: active ? 1 : 0,
            opacity: active ? 1 : 0,
          }}
          transition={{ duration: 0.15 }}
        />

        {/* Button content */}
        <motion.span
          className="relative z-10 flex items-center justify-center"
          style={{
            scale: active ? 1.05 : 1,
          }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.span>
      </motion.div>
    );

    if (href) {
      return <Link href={href}>{buttonContent}</Link>;
    }

    return buttonContent;
  };

  return renderButton();
};
