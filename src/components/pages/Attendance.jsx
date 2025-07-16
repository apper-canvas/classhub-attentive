import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import AttendanceCalendar from "@/components/organisms/AttendanceCalendar";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { studentService } from "@/services/api/studentService";
import { attendanceService } from "@/services/api/attendanceService";

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyAttendance, setDailyAttendance] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [studentsData, attendanceData] = await Promise.all([
        studentService.getAll(),
        attendanceService.getAll()
      ]);
      setStudents(studentsData.filter(s => s.status === "active"));
      setAttendance(attendanceData);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Load attendance for selected date
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const dayAttendance = attendance.filter(record => 
      format(new Date(record.date), "yyyy-MM-dd") === dateStr
    );
    
    const attendanceMap = {};
    dayAttendance.forEach(record => {
      attendanceMap[record.studentId] = record.status;
    });
    
    setDailyAttendance(attendanceMap);
  }, [attendance, selectedDate]);

  const handleAttendanceChange = async (studentId, status) => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const existingRecord = attendance.find(record => 
        record.studentId === studentId && 
        format(new Date(record.date), "yyyy-MM-dd") === dateStr
      );

      if (existingRecord) {
        await attendanceService.update(existingRecord.Id, { status });
        toast.success("Attendance updated successfully!");
      } else {
        await attendanceService.create({
          studentId,
          date: selectedDate.toISOString(),
          status,
          notes: ""
        });
        toast.success("Attendance recorded successfully!");
      }
      
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to update attendance");
    }
  };

  const markAllPresent = async () => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const promises = students.map(student => {
        const existingRecord = attendance.find(record => 
          record.studentId === student.Id && 
          format(new Date(record.date), "yyyy-MM-dd") === dateStr
        );

        if (existingRecord) {
          return attendanceService.update(existingRecord.Id, { status: "present" });
        } else {
          return attendanceService.create({
            studentId: student.Id,
            date: selectedDate.toISOString(),
            status: "present",
            notes: ""
          });
        }
      });

      await Promise.all(promises);
      toast.success("All students marked as present!");
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to mark all present");
    }
  };

  const getAttendanceStats = () => {
    const total = students.length;
    const present = students.filter(s => dailyAttendance[s.Id] === "present").length;
    const absent = students.filter(s => dailyAttendance[s.Id] === "absent").length;
    const late = students.filter(s => dailyAttendance[s.Id] === "late").length;
    const unmarked = total - present - absent - late;

    return { total, present, absent, late, unmarked };
  };

  if (loading) {
    return <Loading type="cards" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Attendance
          </h1>
          <p className="text-gray-600 mt-1">
            Track daily attendance for {format(selectedDate, "MMMM dd, yyyy")}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => setSelectedDate(new Date())}
          >
            <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
            Today
          </Button>
          <Button
            variant="accent"
            onClick={markAllPresent}
          >
            <ApperIcon name="CheckCheck" className="w-4 h-4 mr-2" />
            Mark All Present
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Calendar */}
        <div className="lg:col-span-2">
          <AttendanceCalendar
            attendanceData={attendance}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>

        {/* Daily Stats */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-display font-semibold text-gray-800 mb-4">
              Daily Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Students</span>
                <span className="font-semibold text-gray-800">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Present</span>
                <Badge variant="success">{stats.present}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Absent</span>
                <Badge variant="error">{stats.absent}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Late</span>
                <Badge variant="warning">{stats.late}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Unmarked</span>
                <Badge variant="info">{stats.unmarked}</Badge>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
                  <span className="text-lg font-bold text-primary-600">
                    {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Attendance List */}
      <div className="card p-6">
        <h3 className="text-lg font-display font-semibold text-gray-800 mb-4">
          Student Attendance - {format(selectedDate, "MMMM dd, yyyy")}
        </h3>
        
        {students.length > 0 ? (
          <div className="space-y-3">
            {students.map((student, index) => (
              <motion.div
                key={student.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {student.gradeLevel}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {["present", "absent", "late"].map((status) => (
                    <Button
                      key={status}
                      variant={dailyAttendance[student.Id] === status ? "primary" : "secondary"}
                      onClick={() => handleAttendanceChange(student.Id, status)}
                      className="px-3 py-1 text-sm"
                    >
                      <ApperIcon 
                        name={status === "present" ? "Check" : status === "absent" ? "X" : "Clock"} 
                        className="w-4 h-4 mr-1" 
                      />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <Empty
            icon="Users"
            title="No Active Students"
            description="Add active students to start tracking attendance"
            action={
              <Button variant="primary">
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Add Students
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default Attendance;