import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import StatCard from "@/components/molecules/StatCard";
import GradeChart from "@/components/organisms/GradeChart";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { studentService } from "@/services/api/studentService";
import { attendanceService } from "@/services/api/attendanceService";
import { gradeService } from "@/services/api/gradeService";
import { format } from "date-fns";

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [studentsData, attendanceData, gradesData] = await Promise.all([
        studentService.getAll(),
        attendanceService.getAll(),
        gradeService.getAll()
      ]);
      
      setStudents(studentsData);
      setAttendance(attendanceData);
      setGrades(gradesData);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Loading type="cards" />
        <Loading type="default" rows={4} />
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === "active").length;
  
  // Today's attendance
  const today = format(new Date(), "yyyy-MM-dd");
  const todayAttendance = attendance.filter(a => 
    format(new Date(a.date), "yyyy-MM-dd") === today
  );
  const attendanceRate = todayAttendance.length > 0 
    ? Math.round((todayAttendance.filter(a => a.status === "present").length / todayAttendance.length) * 100)
    : 0;

  // Recent grades average
  const recentGrades = grades.slice(-10);
  const averageGrade = recentGrades.length > 0
    ? Math.round(recentGrades.reduce((sum, g) => sum + (g.score / g.maxScore * 100), 0) / recentGrades.length)
    : 0;

  // Recent activity
  const recentActivity = [
    ...attendance.slice(-3).map(a => ({
      type: "attendance",
      message: `${students.find(s => s.Id === a.studentId)?.firstName || "Student"} marked ${a.status}`,
      time: format(new Date(a.date), "MMM dd, h:mm a"),
      status: a.status
    })),
    ...grades.slice(-3).map(g => ({
      type: "grade",
      message: `${students.find(s => s.Id === g.studentId)?.firstName || "Student"} received ${g.score}/${g.maxScore} in ${g.subject}`,
      time: format(new Date(g.date), "MMM dd, h:mm a"),
      status: g.score / g.maxScore >= 0.8 ? "success" : g.score / g.maxScore >= 0.6 ? "warning" : "error"
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  // Students needing attention
  const studentsNeedingAttention = students.filter(student => {
    const studentAttendance = attendance.filter(a => a.studentId === student.Id);
    const studentGrades = grades.filter(g => g.studentId === student.Id);
    
    const recentAttendance = studentAttendance.slice(-10);
    const attendanceRate = recentAttendance.length > 0
      ? recentAttendance.filter(a => a.status === "present").length / recentAttendance.length
      : 1;
    
    const recentGrades = studentGrades.slice(-3);
    const gradeAverage = recentGrades.length > 0
      ? recentGrades.reduce((sum, g) => sum + (g.score / g.maxScore), 0) / recentGrades.length
      : 1;
    
    return attendanceRate < 0.8 || gradeAverage < 0.7;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening in your classroom today.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/students">
            <Button variant="secondary">
              <ApperIcon name="Users" className="w-4 h-4 mr-2" />
              Manage Students
            </Button>
          </Link>
          <Link to="/attendance">
            <Button variant="primary">
              <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
              Take Attendance
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon="Users"
          gradient="from-primary-500 to-primary-600"
        />
        <StatCard
          title="Active Students"
          value={activeStudents}
          icon="UserCheck"
          gradient="from-success-500 to-success-600"
        />
        <StatCard
          title="Today's Attendance"
          value={`${attendanceRate}%`}
          icon="Calendar"
          gradient="from-warning-500 to-warning-600"
          trend={attendanceRate >= 80 ? "up" : "down"}
          trendValue={`${attendanceRate}%`}
        />
        <StatCard
          title="Class Average"
          value={`${averageGrade}%`}
          icon="TrendingUp"
          gradient="from-secondary-500 to-secondary-600"
          trend={averageGrade >= 75 ? "up" : "down"}
          trendValue={`${averageGrade}%`}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {grades.length > 0 ? (
            <GradeChart grades={grades} students={students} />
          ) : (
            <div className="card p-6">
              <Empty
                icon="BarChart3"
                title="No Grade Data"
                description="Start entering grades to see performance charts"
                action={
                  <Link to="/grades">
                    <Button variant="primary">
                      <ApperIcon name="BookOpen" className="w-4 h-4 mr-2" />
                      Add Grades
                    </Button>
                  </Link>
                }
              />
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-lg font-display font-semibold text-gray-800 mb-4">
              Recent Activity
            </h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === "attendance" 
                        ? "bg-primary-100 text-primary-600" 
                        : "bg-secondary-100 text-secondary-600"
                    }`}>
                      <ApperIcon 
                        name={activity.type === "attendance" ? "Calendar" : "BookOpen"} 
                        className="w-4 h-4" 
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>

          {/* Students Needing Attention */}
          <div className="card p-6">
            <h3 className="text-lg font-display font-semibold text-gray-800 mb-4">
              Students Needing Attention
            </h3>
            {studentsNeedingAttention.length > 0 ? (
              <div className="space-y-3">
                {studentsNeedingAttention.slice(0, 5).map((student) => (
                  <div key={student.Id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-error-500 to-error-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs">
                          {student.firstName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.gradeLevel}
                        </p>
                      </div>
                    </div>
                    <Badge variant="warning">
                      Attention
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">All students are doing well!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;