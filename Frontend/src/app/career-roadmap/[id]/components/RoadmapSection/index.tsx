import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { ProgressCircle } from '../ProgressCircle';
import { RoadmapStep } from '../RoadmapStep';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

export const RoadmapSection = ({
  name,
  description,
  subjects,
  index,
}: {
  name: string;
  description: string;
  subjects: {
    id: string;
    subject: {
      id: string;
      title: string;
      description: string;
      icon: React.ElementType;
    };
  }[];
  index: number;
}) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const completed = 50; // This should be calculated based on actual progress

  return (
    <motion.div
      className="mb-12"
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={sectionVariants}
      transition={{ duration: 0.5, delay: index * 0.2 }}
    >
      <div className="rounded-lg border-l-4 border-primary bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-primary">{name}</h3>
          <ProgressCircle completed={completed} />
        </div>
        <p className="mb-6 text-card-foreground">{description}</p>
        <div className="space-y-4">
          {subjects?.map((step, stepIndex) => (
            <RoadmapStep
              key={step.id}
              id={step.id}
              name={step.subject?.title}
              description={step.subject?.description}
              icon={step.subject?.icon}
              index={stepIndex}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
