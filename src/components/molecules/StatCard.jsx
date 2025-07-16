import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  gradient = "from-primary-500 to-primary-600",
  className 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("card p-6 bg-gradient-to-br from-white to-gray-50", className)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient}`}>
          <ApperIcon name={icon} className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${
            trend === "up" ? "text-success-600" : "text-error-600"
          }`}>
            <ApperIcon 
              name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
              className="w-4 h-4 mr-1" 
            />
            {trendValue}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-display font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          {value}
        </h3>
        <p className="text-gray-600 text-sm font-medium">
          {title}
        </p>
      </div>
    </motion.div>
  );
};

export default StatCard;