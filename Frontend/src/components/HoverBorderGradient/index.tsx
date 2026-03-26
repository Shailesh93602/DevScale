'use client';

import React, { useState, useEffect, ReactNode, ElementType } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = 'button',
  duration = 1,
  clockwise = true,
  href,
  ...props
}: {
  children: ReactNode;
  containerClassName?: string;
  className?: string;
  as?: ElementType;
  duration?: number;
  clockwise?: boolean;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState('TOP');
  const router = useRouter();

  const rotateDirection = (currentDirection: string) => {
    const directions = ['TOP', 'LEFT', 'BOTTOM', 'RIGHT'];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  const movingMap = {
    TOP: 'radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
    LEFT: 'radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
    BOTTOM:
      'radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
    RIGHT:
      'radial-gradient(16.2% 41.199999999999996% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)',
  };

  const highlight =
    'radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)';

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered, duration]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (href) {
      e.preventDefault();
      router.push(href);
    }
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      className={cn(
        'bg-blue-700/20 relative flex h-min w-fit flex-col flex-nowrap content-center items-center justify-center gap-10 overflow-visible rounded-full border decoration-clone p-px transition duration-500 hover:bg-foreground/10',
        containerClassName,
      )}
      {...props}
    >
      <div
        className={cn(
          'z-10 w-auto rounded-[inherit] bg-black px-4 py-2 text-white',
          className,
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          'absolute inset-0 z-0 flex-none overflow-hidden rounded-[inherit]',
        )}
        style={{
          filter: 'blur(2px)',
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
        initial={{ background: movingMap[direction as keyof object] }}
        animate={{
          background: hovered
            ? [movingMap[direction as keyof object], highlight]
            : movingMap[direction as keyof object],
        }}
        transition={{ ease: 'linear', duration: duration }}
      />
      <div className="z-1 absolute inset-[2px] flex-none rounded-[100px] bg-black" />
    </Tag>
  );
}
