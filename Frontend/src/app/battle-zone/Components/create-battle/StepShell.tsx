import type { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const STEP_CARD_CLASS =
  'border-primary/20 hover:border-primary/40 border-2 transition-all duration-300';

/** Animated entry for one wizard step. */
export function StepMotion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** The bordered card most steps render inside. */
export function StepCard({
  children,
  contentClassName,
}: {
  children: ReactNode;
  contentClassName: string;
}) {
  return (
    <StepMotion>
      <Card className={STEP_CARD_CLASS}>
        <CardContent className={contentClassName}>{children}</CardContent>
      </Card>
    </StepMotion>
  );
}

export function HelpTip({
  children,
  contentClassName,
}: {
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent className={contentClassName}>
          <p>{children}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
