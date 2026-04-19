'use client';
import React, { ReactNode, useRef } from 'react';
import { useMotionValueEvent, useScroll, motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { HoverBorderGradient } from '../HoverBorderGradient';
import { AceternityLogo } from '@/components/AceternityLogo';

export const StickyScroll = ({
  content = [],
  contentClassName,
}: {
  content?: { title?: string; description?: string; content?: ReactNode }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ['start start', 'end start'],
  });
  const cardLength = content?.length ?? 0;

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const cardsBreakpoints =
      content?.map((_, index) => index / cardLength) ?? [];
    const closestBreakpointIndex = cardsBreakpoints?.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = [
    'var(--slate-900)',
    'var(--black)',
    'var(--neutral-900)',
  ];
  const linearGradients = [
    'linear-gradient(to bottom right, var(--cyan-500), var(--emerald-500))',
    'linear-gradient(to bottom right, var(--pink-500), var(--indigo-500))',
    'linear-gradient(to bottom right, var(--orange-500), var(--yellow-500))',
  ];

  const backgroundGradient =
    linearGradients[activeCard % linearGradients.length];

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="relative flex h-[25rem] justify-center space-x-10 overflow-y-auto rounded-md"
      ref={ref}
    >
      <div className="div relative flex items-start px-4">
        <div key="1" className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Expand Your Knowledge
          </h2>
          {content.map((item, index) => (
            <>
              <div key={(item.title ?? '') + index} className="my-10">
                <motion.h2
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: activeCard === index ? 1 : 0.3,
                  }}
                  className="text-2xl font-bold text-slate-100"
                >
                  {item.title}
                </motion.h2>
                <motion.p
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: activeCard === index ? 1 : 0.3,
                  }}
                  className="text-kg mt-10 max-w-sm text-slate-300"
                >
                  {item.description}
                </motion.p>
              </div>
              <HoverBorderGradient
                containerClassName="rounded-full"
                as="button"
                href="/resources"
                className="flex items-center space-x-2 bg-background text-foreground"
              >
                <AceternityLogo />
                <span>Explore Resources</span>
              </HoverBorderGradient>
            </>
          ))}
          <div className="pb-9" />
        </div>
      </div>

      <div
        key="2"
        style={{ background: backgroundGradient }}
        className={cn(
          'sticky top-10 hidden h-60 w-80 overflow-hidden rounded-md bg-white lg:block',
          contentClassName,
        )}
      >
        {content[activeCard].content ?? null}
      </div>
    </motion.div>
  );
};
