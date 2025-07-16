import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const ActionMenu = ({ actions, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ApperIcon name="MoreVertical" className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-full z-20 mt-2 w-48 bg-white rounded-lg shadow-elevated border border-gray-200"
            >
              <div className="py-2">
                {actions.map((action, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    onClick={() => {
                      action.onClick();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:text-gray-900 flex items-center space-x-2"
                  >
                    {action.icon && (
                      <ApperIcon name={action.icon} className="w-4 h-4" />
                    )}
                    <span>{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionMenu;