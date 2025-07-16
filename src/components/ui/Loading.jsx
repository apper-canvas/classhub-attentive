import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const Loading = ({ className, type = "default", rows = 3 }) => {
  const shimmer = {
    hidden: { opacity: 0.3 },
    visible: { 
      opacity: 0.7,
      transition: { 
        duration: 1, 
        repeat: Infinity, 
        repeatType: "reverse" 
      }
    }
  };

  if (type === "table") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded"
              variants={shimmer}
              initial="hidden"
              animate="visible"
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <motion.div
                key={j}
                className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"
                variants={shimmer}
                initial="hidden"
                animate="visible"
                transition={{ delay: (i * 4 + j) * 0.1 }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-lg shadow-card p-6 space-y-4"
            variants={shimmer}
            initial="hidden"
            animate="visible"
            transition={{ delay: i * 0.1 }}
          >
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2" />
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"
          variants={shimmer}
          initial="hidden"
          animate="visible"
          transition={{ delay: i * 0.1 }}
          style={{ width: `${100 - (i * 10)}%` }}
        />
      ))}
    </div>
  );
};

export default Loading;