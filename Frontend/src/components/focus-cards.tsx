'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
    onClick,
  }: {
    card: { title: string; thumbnail?: string; description?: string };
    index: number;
    hovered: number | null;
    setHovered: (index: number | null) => void;
    onClick: (title: string) => void;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      onClick={() => onClick(card.title)}
      className={cn(
        'relative h-60 w-full cursor-pointer overflow-hidden rounded-lg bg-light transition-all duration-300 ease-out md:h-96',
        hovered !== null && hovered !== index && 'scale-[0.98] blur-sm',
      )}
    >
      <Image
        src={card.thumbnail ?? '/no-image.png'}
        alt={card.title}
        fill
        className="absolute inset-0 object-cover"
      />
      <div
        className={cn(
          'absolute inset-0 flex items-end bg-black/50 px-4 py-8 transition-opacity duration-300',
          hovered === index ? 'opacity-0' : 'opacity-100',
        )}
      >
        <div className="bg-gradient-to-b from-neutral-50 to-neutral-200 bg-clip-text text-xl font-medium text-transparent md:text-2xl">
          {card.title}
        </div>
      </div>
      <div
        className={cn(
          'absolute inset-0 flex items-end bg-black/50 px-4 py-8 transition-opacity duration-300',
          hovered === index ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className="bg-gradient-to-b from-neutral-50 to-neutral-200 bg-clip-text text-xl font-medium text-transparent md:text-2xl">
          {card.description}
        </div>
      </div>
    </div>
  ),
);

Card.displayName = 'Card';

export function FocusCards({
  roadmaps,
}: {
  roadmaps: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState<number | null>(null);

  const handleCardClick = (id: string) => {
    router.push(`/career-roadmap/${id}`);
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-10 md:grid-cols-3 md:px-8">
      {Boolean(roadmaps?.length) && (
        <>
          {roadmaps?.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              index={index}
              hovered={hovered}
              setHovered={setHovered}
              onClick={() => handleCardClick(card.id)}
            />
          ))}
        </>
      )}
    </div>
  );
}
