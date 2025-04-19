'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface IParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

interface ParticleFieldProps {
  className?: string;
  particleCount?: number;
  particleColor?: string;
  lineColor?: string;
  particleSize?: number;
  speed?: number;
  connectionRadius?: number;
  interactive?: boolean;
}

export const ParticleField = ({
  className,
  particleCount = 50,
  particleColor = 'rgba(131, 0, 184, 0.7)',
  lineColor = 'rgba(131, 0, 184, 0.2)',
  particleSize = 2,
  speed = 0.5,
  connectionRadius = 150,
  interactive = true,
}: ParticleFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<IParticle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, radius: connectionRadius });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const handleResize = () => {
      if (!canvas || !container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -connectionRadius;
      mouseRef.current.y = -connectionRadius;
    };

    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: Math.random() * particleSize + 1,
          color: particleColor,
        });
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        // Connect particles
        connectParticles(particle);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const connectParticles = (particle: IParticle) => {
      if (!ctx) return;

      // Connect to other particles
      particlesRef.current.forEach((otherParticle) => {
        if (particle === otherParticle) return;

        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionRadius) {
          // Draw line with opacity based on distance
          const opacity = 1 - distance / connectionRadius;
          ctx.beginPath();
          ctx.strokeStyle = lineColor.replace(')', `, ${opacity})`);
          ctx.lineWidth = 0.5;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.stroke();
        }
      });

      // Connect to mouse if interactive
      if (interactive) {
        const dx = particle.x - mouseRef.current.x;
        const dy = particle.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseRef.current.radius) {
          // Draw line with opacity based on distance
          const opacity = 1 - distance / mouseRef.current.radius;
          ctx.beginPath();
          ctx.strokeStyle = lineColor.replace(')', `, ${opacity * 1.5})`);
          ctx.lineWidth = 1;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.stroke();

          // Add slight attraction to mouse
          particle.x += dx * 0.01;
          particle.y += dy * 0.01;
        }
      }
    };

    // Initialize
    canvas.width = width;
    canvas.height = height;
    initParticles();
    animate();

    // Event listeners
    window.addEventListener('resize', handleResize);
    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, [
    particleCount,
    particleColor,
    lineColor,
    particleSize,
    speed,
    connectionRadius,
    interactive,
  ]);

  return (
    <div ref={containerRef} className={cn('relative h-full w-full', className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
};
