'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TextScrambleProps {
  text: string;
  className?: string;
  speed?: number;
  scrambleSpeed?: number;
  pauseTime?: number;
  characters?: string;
  onComplete?: () => void;
}

export const TextScramble = ({
  text,
  className,
  scrambleSpeed = 20,
  pauseTime = 2000,
  characters = '!<>-_\\/[]{}—=+*^?#_abcdefghijklmnopqrstuvwxyz0123456789',
  onComplete,
}: TextScrambleProps) => {
  const [displayText, setDisplayText] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const frameRef = useRef<number | null>(null);
  const charsRef = useRef<
    { from: string; to: string; start: number; end: number; char: string }[]
  >([]);

  // Start the effect on mount
  useEffect(() => {
    const update = () => {
      let complete = true;
      let output = '';

      for (let i = 0, n = charsRef.current.length; i < n; i++) {
        const char = charsRef.current[i];

        if (char.start > 0) {
          complete = false;
          char.start--;
          output += char.from;
        } else if (char.end > 0) {
          complete = false;
          char.end--;
          output += characters[Math.floor(Math.random() * characters.length)];
        } else {
          output += char.to;
        }
      }

      setDisplayText(output);

      if (complete) {
        if (onComplete) onComplete();
        timeoutRef.current = setTimeout(() => {
          startScramble();
        }, pauseTime);
        return;
      }

      frameRef.current = requestAnimationFrame(update);
    };

    const startScramble = () => {
      charsRef.current = new Array(text.length).fill(0).map((_, i) => ({
        from: '',
        to: text[i],
        start: Math.floor(Math.random() * scrambleSpeed),
        end: Math.floor(Math.random() * scrambleSpeed) + scrambleSpeed / 2,
        char: '',
      }));

      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(update);
    };

    startScramble();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, scrambleSpeed, characters, pauseTime, onComplete]);

  return (
    <span className={cn('inline-block', className)}>{displayText || text}</span>
  );
};
