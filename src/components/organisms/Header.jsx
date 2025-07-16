import { useState } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";

const Header = ({ onMenuToggle, onSearch }) => {
  const [notifications] = useState([
    { id: 1, message: "John Doe has been absent for 2 days", type: "warning" },
    { id: 2, message: "Grade reports are ready for review", type: "info" },
    { id: 3, message: "3 new students enrolled today", type: "success" },
  ]);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onMenuToggle}
            className="lg:hidden p-2"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </Button>
          
          <div className="hidden md:block">
            <SearchBar
              placeholder="Search students, classes, or grades..."
              onSearch={onSearch}
              className="w-80"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="md:hidden">
            <Button variant="ghost" className="p-2">
              <ApperIcon name="Search" className="w-5 h-5" />
            </Button>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <Button variant="ghost" className="p-2 relative">
              <ApperIcon name="Bell" className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
          </motion.div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <ApperIcon name="User" className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">Sarah Johnson</p>
              <p className="text-xs text-gray-600">Mathematics Teacher</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;