"use client";
import Image from "next/image";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const images = [
  "/images/carrer-roadmap/material_1.png",
  "/images/carrer-roadmap/material_2.png",
  "/images/carrer-roadmap/material_3.png",
  "/images/carrer-roadmap/material_4.png",
  "/images/carrer-roadmap/material_5.png",
  "/images/carrer-roadmap/material_6.png",
  "/images/carrer-roadmap/material_7.png",
  "/images/carrer-roadmap/material_8.png",
];

export const Card = React.memo(
  ({ card, index, hovered, setHovered, onClick, resources, imageSrc }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      onClick={() => onClick(card.title)}
      className={cn(
        "rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out cursor-pointer",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      <Image
        src={imageSrc}
        alt={card.title}
        fill
        className="object-cover absolute inset-0"
      />
      <div
        className={cn(
          "absolute inset-0 bg-black/50 flex items-end py-8 px-4 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="text-xl md:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
          {card.title}
        </div>
      </div>
    </div>
  )
);

Card.displayName = "Card";

export function FocusCards({ cards, resources }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(null);

  const handleCardClick = (id) => {
    router.push(`/career-roadmap/${id}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto md:px-8 w-full">
      {resources && (
        <>
          {resources?.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              resources={resources}
              index={index}
              hovered={hovered}
              setHovered={setHovered}
              onClick={() => handleCardClick(card.id)}
              imageSrc={images[index % images.length]}
            />
          ))}
        </>
      )}
    </div>
  );
}
