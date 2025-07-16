import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Attendance from "@/components/pages/Attendance";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const AttendanceCalendar = ({ 
  attendanceData, 
  onDateSelect, 
  selectedDate,
  className 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateState, setSelectedDateState] = useState(selectedDate || new Date());

  useEffect(() => {
    if (selectedDate) {
      setSelectedDateState(selectedDate);
    }
  }, [selectedDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  const getAttendanceForDate = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return attendanceData.filter(record => 
      format(new Date(record.date), "yyyy-MM-dd") === dateStr
    );
  };

  const getAttendanceStats = (date) => {
    const records = getAttendanceForDate(date);
    const total = records.length;
    const present = records.filter(r => r.status === "present").length;
    const absent = records.filter(r => r.status === "absent").length;
    const late = records.filter(r => r.status === "late").length;
    
    return { total, present, absent, late };
  };

  const getDayColor = (date) => {
    const stats = getAttendanceStats(date);
    if (stats.total === 0) return "bg-gray-100";
    
    const presentRate = stats.present / stats.total;
    if (presentRate >= 0.9) return "bg-success-100 border-success-200";
    if (presentRate >= 0.7) return "bg-warning-100 border-warning-200";
    return "bg-error-100 border-error-200";
  };

while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isSelected = isSameDay(day, selectedDateState);
      const isToday = isSameDay(day, new Date());
      const stats = getAttendanceStats(day);

      days.push(
        <motion.div
          key={day.toISOString()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative p-2 cursor-pointer border border-gray-200 min-h-[80px] transition-all duration-200",
            isCurrentMonth ? "bg-white" : "bg-gray-50",
            isSelected && "ring-2 ring-primary-500 ring-offset-2",
            isToday && "bg-primary-50",
            !isCurrentMonth && "text-gray-400",
            getDayColor(day)
          )}
          onClick={() => {
            setSelectedDateState(cloneDay);
            onDateSelect?.(cloneDay);
          }}
        >
          <div className="flex justify-between items-start">
            <span className={cn(
              "text-sm font-medium",
              isToday && "text-primary-700 font-bold"
            )}>
              {formattedDate}
            </span>
            {isToday && (
              <Badge variant="info" className="text-xs px-2 py-1">
                Today
              </Badge>
            )}
          </div>
          
          {stats.total > 0 && (
            <div className="mt-1 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-success-600">P: {stats.present}</span>
                <span className="text-error-600">A: {stats.absent}</span>
                <span className="text-warning-600">L: {stats.late}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-success-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.present / stats.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </motion.div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={format(day, "yyyy-MM-dd")} className="grid grid-cols-7 gap-1">
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className={cn("card p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-semibold text-gray-800">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2"
          >
            <ApperIcon name="ChevronLeft" className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-2 text-sm"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2"
          >
            <ApperIcon name="ChevronRight" className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>
      
      <div className="space-y-1">
        {rows}
      </div>
      
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-success-100 border border-success-200 rounded" />
          <span className="text-gray-600">High Attendance (90%+)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-warning-100 border border-warning-200 rounded" />
          <span className="text-gray-600">Medium Attendance (70-89%)</span>
</div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-error-100 border border-error-200 rounded" />
          <span className="text-gray-600">Low Attendance (&lt;70%)</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;