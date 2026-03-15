import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaUserGraduate, FaUserTie, FaUserAstronaut } from 'react-icons/fa';

// Enhanced testimonial component with improved animations
const Testimonial = ({
  name,
  role,
  quote,
  image,
  delay,
}: {
  readonly name: string;
  readonly role: string;
  readonly quote: string;
  readonly image: string;
  readonly delay: number;
}) => {
  return (
    <motion.div
      className="from-[var(--primary)]/20 to-[var(--primary2)]/20 hover:from-[var(--primary)]/30 hover:to-[var(--primary2)]/30 group relative flex cursor-pointer flex-col items-center rounded-xl border border-border bg-card/80 bg-gradient-to-br p-8 shadow-lg backdrop-blur-md transition-shadow duration-300 hover:shadow-2xl"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.03 }}
    >
      <motion.div
        className="border-[var(--primary)]/30 bg-primary/10 !shadow-primary/30 group-hover:!shadow-primary/50 relative mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 text-primary shadow-lg transition-shadow duration-300 group-hover:shadow-2xl"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        <Image
          src={image}
          alt={name}
          width={48}
          height={48}
          className="h-full w-full rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            (
              e.currentTarget.nextElementSibling as HTMLElement
            )?.classList.remove('hidden');
          }}
        />
        {/* Fallback icon for testimonial image */}
        {name === 'Rahul Sharma' && (
          <FaUserGraduate className="absolute inset-0 m-auto hidden text-4xl" />
        )}
        {name === 'Priya Patel' && (
          <FaUserAstronaut className="absolute inset-0 m-auto hidden text-4xl" />
        )}
        {name === 'Arjun Mehta' && (
          <FaUserTie className="absolute inset-0 m-auto hidden text-4xl" />
        )}
      </motion.div>
      <h4 className="mb-1 text-center text-xl font-bold text-foreground">
        {name}
      </h4>
      <p className="text-center text-sm text-muted-foreground">{role}</p>
      <motion.p
        className="mt-4 text-center italic text-foreground/90"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
      >
        “{quote}”
      </motion.p>
    </motion.div>
  );
};

export default Testimonial;
