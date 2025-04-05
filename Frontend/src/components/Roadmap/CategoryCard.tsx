import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface CategoryType {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

interface CategoryCardProps {
  category: CategoryType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  icon: LucideIcon;
  index?: number;
}

// Add a skeleton loader for category cards
export const CategoryCardSkeleton = () => (
  <div className="flex cursor-default flex-col items-center justify-center rounded-xl border bg-card p-6 shadow-sm">
    <div className="mb-3 h-12 w-12 animate-pulse rounded-full bg-gray-200" />
    <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
  </div>
);

const CategoryCard = ({
  category,
  isSelected,
  onSelect,
  icon: Icon,
  index = 0,
}: CategoryCardProps) => {
  // Card variants for animation
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md ${
        isSelected ? 'bg-primary/5 border-primary' : 'hover:border-primary/40'
      }`}
      onClick={() => onSelect(category.id)}
    >
      <div className="bg-primary/10 mb-3 rounded-full p-3 text-primary">
        <Icon size={24} />
      </div>
      <h3 className="text-center font-medium">{category.name}</h3>
    </motion.div>
  );
};

export default CategoryCard;
