import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Empty = ({ 
  icon = "Users", 
  title = "No data found", 
  description = "Get started by adding your first item", 
  action,
  className 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center space-y-6 bg-gradient-to-br from-gray-50 to-primary-50 rounded-lg border border-gray-200",
        className
      )}
    >
      <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
        <ApperIcon name={icon} className="w-10 h-10 text-white" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-display font-semibold text-gray-800">
          {title}
        </h3>
        <p className="text-gray-600 max-w-md">
          {description}
        </p>
      </div>
      
      {action && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Empty;