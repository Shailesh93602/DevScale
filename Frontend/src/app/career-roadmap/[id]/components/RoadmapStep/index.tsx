import { motion } from "framer-motion";

const nodeVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const RoadmapStep = ({
  id,
  name,
  description,
  icon: Icon,
  index,
}: {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  index: number;
}) => (
  <motion.div
    className="bg-accent p-4 rounded-lg shadow-md flex items-start hover:shadow-lg transition-shadow duration-300"
    variants={nodeVariants}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.3, delay: index * 0.1 }}
  >
    <div className="mr-4 bg-primary text-primary-foreground p-2 rounded-full">
      {Icon && <Icon size={24} />}
    </div>
    <div>
      <h4 className="text-lg font-semibold text-accent-foreground">{name}</h4>
      <p className="text-muted-foreground mt-1">{description}</p>
      {id && (
        <a
          href={`/resources/${id}`}
          target="_blank"
          className="text-primary hover:text-primary2 hover:underline mt-2 inline-block transition-colors duration-200"
        >
          Learn more →
        </a>
      )}
    </div>
  </motion.div>
);
