import { motion } from 'framer-motion';

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
    className="flex items-start rounded-lg bg-accent p-4 shadow-md transition-shadow duration-300 hover:shadow-lg"
    variants={nodeVariants}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.3, delay: index * 0.1 }}
  >
    <div className="mr-4 rounded-full bg-primary p-2 text-primary-foreground">
      {Icon && <Icon size={24} />}
    </div>
    <div>
      <h4 className="text-lg font-semibold text-accent-foreground">{name}</h4>
      <p className="mt-1 text-muted-foreground">{description}</p>
      {id && (
        <a
          href={`/resources/${id}`}
          target="_blank"
          className="mt-2 inline-block text-primary transition-colors duration-200 hover:text-primary2 hover:underline"
        >
          Learn more →
        </a>
      )}
    </div>
  </motion.div>
);
