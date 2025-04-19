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
  const currentTextRef = useRef('');
  const targetTextRef = useRef('');
  const charsRef = useRef<
    { from: string; to: string; start: number; end: number; char: string }[]
  >([]);

  // Initialize the scramble effect
  const startScramble = () => {
    currentTextRef.current = '';
    targetTextRef.current = text;

    // Create an array of character objects to track the scramble
    charsRef.current = new Array(text.length).fill(0).map((_, i) => ({
      from: '',
      to: text[i],
      start: Math.floor(Math.random() * scrambleSpeed),
      end: Math.floor(Math.random() * scrambleSpeed) + scrambleSpeed / 2,
      char: '',
    }));

    // Start the animation
    update();
  };

  // Update function for the scramble animation
  const update = () => {
    let complete = true;
    let output = '';

    for (let i = 0, n = charsRef.current.length; i < n; i++) {
      const char = charsRef.current[i];

      // If this character hasn't started scrambling yet
      if (char.start > 0) {
        complete = false;
        char.start--;
        output += char.from;
      }
      // If this character is still scrambling
      else if (char.end > 0) {
        complete = false;
        char.end--;

        // Get a random character from the character set
        const randomChar =
          characters[Math.floor(Math.random() * characters.length)];
        output += randomChar;
      }
      // This character has finished scrambling
      else {
        output += char.to;
      }
    }

    // Update the display text
    setDisplayText(output);

    // If all characters have finished scrambling
    if (complete) {
      if (onComplete) onComplete();

      // Schedule the next scramble after pause time
      timeoutRef.current = setTimeout(() => {
        startScramble();
      }, pauseTime);

      return;
    }

    // Continue the animation
    frameRef.current = requestAnimationFrame(update);
  };

  // Start the effect on mount
  useEffect(() => {
    // Create a stable reference to the startScramble function
    const startScrambleStable = () => {
      currentTextRef.current = '';
      targetTextRef.current = text;

      // Create an array of character objects to track the scramble
      charsRef.current = new Array(text.length).fill(0).map((_, i) => ({
        from: '',
        to: text[i],
        start: Math.floor(Math.random() * scrambleSpeed),
        end: Math.floor(Math.random() * scrambleSpeed) + scrambleSpeed / 2,
        char: '',
      }));

      // Start the animation
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(update);
    };

    startScrambleStable();

    // Clean up on unmount
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, scrambleSpeed]); // Only re-run when text or scrambleSpeed changes

  return (
    <span className={cn('inline-block', className)}>{displayText || text}</span>
  );
};
