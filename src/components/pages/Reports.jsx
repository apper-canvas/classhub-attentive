import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import StatCard from "@/components/molecules/StatCard";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { studentService } from "@/services/api/studentService";
import { attendanceService } from "@/services/api/attendanceService";
import { gradeService } from "@/services/api/gradeService";

const Reports = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [reportType, setReportType] = useState("individual");

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
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStudentAttendanceRate = (studentId) => {
    const studentAttendance = attendance.filter(a => a.studentId === studentId);
    if (studentAttendance.length === 0) return 0;
    
    const presentCount = studentAttendance.filter(a => a.status === "present").length;
    return Math.round((presentCount / studentAttendance.length) * 100);
  };

  const getStudentGradeAverage = (studentId) => {
    const studentGrades = grades.filter(g => g.studentId === studentId);
    if (studentGrades.length === 0) return 0;
    
    const total = studentGrades.reduce((sum, g) => sum + (g.score / g.maxScore * 100), 0);
    return Math.round(total / studentGrades.length);
  };

  const getSubjectAverage = (studentId, subject) => {
    const subjectGrades = grades.filter(g => g.studentId === studentId && g.subject === subject);
    if (subjectGrades.length === 0) return 0;
    
    const total = subjectGrades.reduce((sum, g) => sum + (g.score / g.maxScore * 100), 0);
    return Math.round(total / subjectGrades.length);
  };

  const getClassStats = () => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === "active").length;
    
    const totalAttendance = attendance.length;
    const presentCount = attendance.filter(a => a.status === "present").length;
    const overallAttendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;
    
    const totalGrades = grades.length;
    const overallGradeAverage = totalGrades > 0 
      ? Math.round(grades.reduce((sum, g) => sum + (g.score / g.maxScore * 100), 0) / totalGrades)
      : 0;
    
    return {
      totalStudents,
      activeStudents,
      overallAttendanceRate,
      overallGradeAverage
    };
  };

  const getTopPerformers = () => {
    return students
      .filter(s => s.status === "active")
      .map(student => ({
        ...student,
        gradeAverage: getStudentGradeAverage(student.Id),
        attendanceRate: getStudentAttendanceRate(student.Id)
      }))
      .sort((a, b) => b.gradeAverage - a.gradeAverage)
      .slice(0, 5);
  };

  const getStudentsNeedingAttention = () => {
    return students
      .filter(s => s.status === "active")
      .map(student => ({
        ...student,
        gradeAverage: getStudentGradeAverage(student.Id),
        attendanceRate: getStudentAttendanceRate(student.Id)
      }))
      .filter(student => student.gradeAverage < 70 || student.attendanceRate < 80)
      .sort((a, b) => a.gradeAverage - b.gradeAverage);
  };

  const generateIndividualReport = (studentId) => {
    const student = students.find(s => s.Id === studentId);
    if (!student) return null;

    const studentGrades = grades.filter(g => g.studentId === studentId);
    const studentAttendance = attendance.filter(a => a.studentId === studentId);
    
    const subjects = [...new Set(studentGrades.map(g => g.subject))];
    const subjectPerformance = subjects.map(subject => ({
      subject,
      average: getSubjectAverage(studentId, subject),
      gradeCount: studentGrades.filter(g => g.subject === subject).length
    }));

    return {
      student,
      overallGrade: getStudentGradeAverage(studentId),
      attendanceRate: getStudentAttendanceRate(studentId),
      totalGrades: studentGrades.length,
      totalAttendanceRecords: studentAttendance.length,
      subjectPerformance,
      recentGrades: studentGrades
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    };
  };

  if (loading) {
    return <Loading type="cards" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  const classStats = getClassStats();
  const topPerformers = getTopPerformers();
  const studentsNeedingAttention = getStudentsNeedingAttention();
  const individualReport = selectedStudent ? generateIndividualReport(parseInt(selectedStudent)) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Reports
          </h1>
          <p className="text-gray-600 mt-1">
            View comprehensive reports and analytics
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant={reportType === "class" ? "primary" : "secondary"}
            onClick={() => setReportType("class")}
          >
            <ApperIcon name="BarChart3" className="w-4 h-4 mr-2" />
            Class Report
          </Button>
          <Button
            variant={reportType === "individual" ? "primary" : "secondary"}
            onClick={() => setReportType("individual")}
          >
            <ApperIcon name="User" className="w-4 h-4 mr-2" />
            Individual Report
          </Button>
        </div>
      </div>

      {reportType === "class" && (
        <div className="space-y-6">
          {/* Class Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Students"
              value={classStats.totalStudents}
              icon="Users"
              gradient="from-primary-500 to-primary-600"
            />
            <StatCard
              title="Active Students"
              value={classStats.activeStudents}
              icon="UserCheck"
              gradient="from-success-500 to-success-600"
            />
            <StatCard
              title="Class Attendance"
              value={`${classStats.overallAttendanceRate}%`}
              icon="Calendar"
              gradient="from-warning-500 to-warning-600"
            />
            <StatCard
              title="Class Average"
              value={`${classStats.overallGradeAverage}%`}
              icon="TrendingUp"
              gradient="from-secondary-500 to-secondary-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <div className="card p-6">
              <h3 className="text-lg font-display font-semibold text-gray-800 mb-4">
                Top Performers
              </h3>
              {topPerformers.length > 0 ? (
                <div className="space-y-4">
                  {topPerformers.map((student, index) => (
                    <motion.div
                      key={student.Id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-success-50 to-transparent rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-success-500 to-success-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-xs">
                            {index + 1}
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
                      <div className="text-right">
                        <p className="text-lg font-bold text-success-600">
                          {student.gradeAverage}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.attendanceRate}% attendance
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No performance data available</p>
              )}
            </div>

            {/* Students Needing Attention */}
            <div className="card p-6">
              <h3 className="text-lg font-display font-semibold text-gray-800 mb-4">
                Students Needing Attention
              </h3>
              {studentsNeedingAttention.length > 0 ? (
                <div className="space-y-4">
                  {studentsNeedingAttention.slice(0, 5).map((student, index) => (
                    <motion.div
                      key={student.Id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-warning-50 to-transparent rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-warning-500 to-warning-600 rounded-full flex items-center justify-center">
                          <ApperIcon name="AlertTriangle" className="w-4 h-4 text-white" />
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
                      <div className="text-right">
                        <p className="text-lg font-bold text-warning-600">
                          {student.gradeAverage}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.attendanceRate}% attendance
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">All students are performing well!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {reportType === "individual" && (
        <div className="space-y-6">
          {/* Student Selection */}
          <div className="card p-6">
            <FormField label="Select Student">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="input-field"
              >
                <option value="">Choose a student</option>
                {students.map(student => (
                  <option key={student.Id} value={student.Id}>
                    {student.firstName} {student.lastName} - {student.gradeLevel}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {individualReport ? (
            <div className="space-y-6">
              {/* Student Overview */}
              <div className="card p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {individualReport.student.firstName.charAt(0)}
                      {individualReport.student.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">
                      {individualReport.student.firstName} {individualReport.student.lastName}
                    </h2>
                    <p className="text-gray-600">
                      {individualReport.student.gradeLevel} • {individualReport.student.email}
                    </p>
                    <Badge variant={individualReport.student.status === "active" ? "success" : "error"}>
                      {individualReport.student.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-primary-50 to-transparent rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">
                      {individualReport.overallGrade}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Grade</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-success-50 to-transparent rounded-lg">
                    <div className="text-2xl font-bold text-success-600">
                      {individualReport.attendanceRate}%
                    </div>
                    <div className="text-sm text-gray-600">Attendance Rate</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-secondary-50 to-transparent rounded-lg">
                    <div className="text-2xl font-bold text-secondary-600">
                      {individualReport.totalGrades}
                    </div>
                    <div className="text-sm text-gray-600">Total Grades</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-warning-50 to-transparent rounded-lg">
                    <div className="text-2xl font-bold text-warning-600">
                      {individualReport.subjectPerformance.length}
                    </div>
                    <div className="text-sm text-gray-600">Subjects</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject Performance */}
                <div className="card p-6">
                  <h3 className="text-lg font-display font-semibold text-gray-800 mb-4">
                    Subject Performance
                  </h3>
                  {individualReport.subjectPerformance.length > 0 ? (
                    <div className="space-y-4">
                      {individualReport.subjectPerformance.map((subject, index) => (
                        <motion.div
                          key={subject.subject}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {subject.subject}
                            </p>
                            <p className="text-sm text-gray-600">
                              {subject.gradeCount} grades
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={subject.average >= 80 ? "success" : subject.average >= 70 ? "warning" : "error"}>
                              {subject.average}%
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No subject data available</p>
                  )}
                </div>

                {/* Recent Grades */}
                <div className="card p-6">
                  <h3 className="text-lg font-display font-semibold text-gray-800 mb-4">
                    Recent Grades
                  </h3>
                  {individualReport.recentGrades.length > 0 ? (
                    <div className="space-y-4">
                      {individualReport.recentGrades.map((grade, index) => (
                        <motion.div
                          key={grade.Id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {grade.assignmentName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {grade.subject} • {format(new Date(grade.date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-800">
                              {grade.score}/{grade.maxScore}
                            </p>
                            <Badge variant={grade.score/grade.maxScore >= 0.8 ? "success" : grade.score/grade.maxScore >= 0.7 ? "warning" : "error"}>
                              {Math.round((grade.score/grade.maxScore) * 100)}%
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No recent grades available</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Empty
              icon="User"
              title="Select a Student"
              description="Choose a student from the dropdown above to view their detailed report"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;