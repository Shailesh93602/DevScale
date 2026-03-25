import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode, useState } from 'react';

export const HoverEffect = ({
  items,
  className,
}: {
  items: { link: string; title?: string; description?: string }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        'grid grid-cols-1 py-8 md:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {items.map((item, idx) => (
        <Link
          href={item?.link}
          key={item?.link}
          className="group relative block h-full w-full p-2"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 block h-full w-full rounded-3xl bg-gray-300/[0.8] dark:bg-gray-300/[0.8]"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={cn(
        'relative z-20 h-full w-full overflow-hidden rounded-2xl border border-transparent bg-blue-200 p-4 group-hover:border-blue-700 dark:border-black/[0.2] dark:bg-black',
        className,
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <h4
      className={cn(
        'mt-4 font-bold tracking-wide text-black dark:text-zinc-100',
        className,
      )}
    >
      {children}
    </h4>
  );
};
export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <p
      className={cn(
        'mt-8 text-sm leading-relaxed tracking-wide text-gray-500 dark:text-zinc-400',
        className,
      )}
    >
      {children}
    </p>
  );
};
