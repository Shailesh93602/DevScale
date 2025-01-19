import { motion } from "framer-motion";

const nodeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
export const RoadmapStep = ({
  id,
  name,
  description,
  icon: Icon,
}: {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}) => (
  <motion.div
    className="bg-light p-4 m-2 rounded shadow-lg flex items-start"
    variants={nodeVariants}
    whileHover={{ scale: 1.04, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
    transition={{ duration: 0.3 }}
  >
    <div className="mr-4">
      {Icon && <Icon className="text-primary" size={24} />}
    </div>
    <div>
      <h4 className="text-lg font-bold">{name}</h4>
      <p className="text-grayText">{description}</p>
      {id && (
        <a
          href={`/resources/${id}`}
          target="_blank"
          className="text-primary hover:text-primary2 hover:underline mt-2 inline-block"
        >
          Learn more
        </a>
      )}
    </div>
  </motion.div>
);
