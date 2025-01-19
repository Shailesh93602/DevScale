import { Parallax } from "react-scroll-parallax";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { ProgressCircle } from "../ProgressCircle";
import { RoadmapStep } from "../RoadmapStep";

const sectionVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const RoadmapSection = ({
  name,
  description,
  subjects,
}: {
  name: string;
  description: string;
  subjects: {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
  }[];
}) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const completed = 50;

  return (
    <Parallax className="parallax-container" scaleY={[20, -20]}>
      <motion.div
        className="p-6 m-4 bg-lightSecondary rounded-lg shadow-md"
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={sectionVariants}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">{name}</h3>
          <ProgressCircle completed={completed} />
        </div>
        <p className="mb-4">{description}</p>
        <div className="ml-6">
          {subjects?.map((step) => (
            <RoadmapStep key={step.id} {...step} />
          ))}
        </div>
      </motion.div>
    </Parallax>
  );
};
