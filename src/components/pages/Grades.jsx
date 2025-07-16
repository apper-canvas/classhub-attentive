import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { studentService } from "@/services/api/studentService";
import { gradeService } from "@/services/api/gradeService";

const Grades = () => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [newGrade, setNewGrade] = useState({
    assignmentName: "",
    score: "",
    maxScore: "100",
    category: "assignment",
    date: format(new Date(), "yyyy-MM-dd")
  });

  const subjects = [
    "Mathematics", "English", "Science", "History", "Geography", 
    "Physics", "Chemistry", "Biology", "Computer Science", "Art"
  ];

  const categories = [
    { value: "assignment", label: "Assignment" },
    { value: "quiz", label: "Quiz" },
    { value: "exam", label: "Exam" },
    { value: "project", label: "Project" },
    { value: "homework", label: "Homework" }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [studentsData, gradesData] = await Promise.all([
        studentService.getAll(),
        gradeService.getAll()
      ]);
      setStudents(studentsData.filter(s => s.status === "active"));
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

  const handleAddGrade = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent || !selectedSubject || !newGrade.assignmentName || !newGrade.score) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await gradeService.create({
        studentId: parseInt(selectedStudent),
        subject: selectedSubject,
        assignmentName: newGrade.assignmentName,
        score: parseFloat(newGrade.score),
        maxScore: parseFloat(newGrade.maxScore),
        category: newGrade.category,
        date: newGrade.date
      });
      
      toast.success("Grade added successfully!");
      setIsAddingGrade(false);
      setNewGrade({
        assignmentName: "",
        score: "",
        maxScore: "100",
        category: "assignment",
        date: format(new Date(), "yyyy-MM-dd")
      });
      setSelectedStudent("");
      setSelectedSubject("");
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to add grade");
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        await gradeService.delete(gradeId);
        toast.success("Grade deleted successfully!");
        loadData();
      } catch (err) {
        toast.error(err.message || "Failed to delete grade");
      }
    }
  };

  const getGradeColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "info";
    if (percentage >= 70) return "warning";
    return "error";
  };

  const getStudentGrades = (studentId) => {
    return grades.filter(g => g.studentId === studentId);
  };

  const getSubjectAverage = (studentId, subject) => {
    const studentGrades = grades.filter(g => g.studentId === studentId && g.subject === subject);
    if (studentGrades.length === 0) return 0;
    
    const total = studentGrades.reduce((sum, g) => sum + (g.score / g.maxScore * 100), 0);
    return Math.round(total / studentGrades.length);
  };

  const getOverallAverage = (studentId) => {
    const studentGrades = grades.filter(g => g.studentId === studentId);
    if (studentGrades.length === 0) return 0;
    
    const total = studentGrades.reduce((sum, g) => sum + (g.score / g.maxScore * 100), 0);
    return Math.round(total / studentGrades.length);
  };

  const filteredGrades = selectedStudent && selectedSubject
    ? grades.filter(g => g.studentId === parseInt(selectedStudent) && g.subject === selectedSubject)
    : grades;

  if (loading) {
    return <Loading type="table" rows={6} />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Grades
          </h1>
          <p className="text-gray-600 mt-1">
            Manage student grades and track academic performance
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddingGrade(true)}
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Grade
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Filter by Student">
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="input-field"
          >
            <option value="">All Students</option>
            {students.map(student => (
              <option key={student.Id} value={student.Id}>
                {student.firstName} {student.lastName}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Filter by Subject">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input-field"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Add Grade Form */}
      {isAddingGrade && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-display font-semibold text-gray-800 mb-4">
            Add New Grade
          </h3>
          <form onSubmit={handleAddGrade} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField label="Student" required>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.Id} value={student.Id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Subject" required>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Assignment Name"
              value={newGrade.assignmentName}
              onChange={(e) => setNewGrade({...newGrade, assignmentName: e.target.value})}
              required
            />

            <FormField
              label="Score"
              type="number"
              value={newGrade.score}
              onChange={(e) => setNewGrade({...newGrade, score: e.target.value})}
              required
            />

            <FormField
              label="Max Score"
              type="number"
              value={newGrade.maxScore}
              onChange={(e) => setNewGrade({...newGrade, maxScore: e.target.value})}
              required
            />

            <FormField label="Category">
              <select
                value={newGrade.category}
                onChange={(e) => setNewGrade({...newGrade, category: e.target.value})}
                className="input-field"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Date"
              type="date"
              value={newGrade.date}
              onChange={(e) => setNewGrade({...newGrade, date: e.target.value})}
              required
            />

            <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAddingGrade(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Add Grade
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Student Performance Overview */}
      {selectedStudent && (
        <div className="card p-6">
          <h3 className="text-lg font-display font-semibold text-gray-800 mb-4">
            Student Performance Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {getOverallAverage(parseInt(selectedStudent))}%
              </div>
              <div className="text-sm text-gray-600">Overall Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">
                {getStudentGrades(parseInt(selectedStudent)).length}
              </div>
              <div className="text-sm text-gray-600">Total Grades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-600">
                {selectedSubject ? getSubjectAverage(parseInt(selectedStudent), selectedSubject) : 0}%
              </div>
              <div className="text-sm text-gray-600">Subject Average</div>
            </div>
          </div>
        </div>
      )}

      {/* Grades Table */}
      {filteredGrades.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGrades.map((grade, index) => {
                  const student = students.find(s => s.Id === grade.studentId);
                  const percentage = Math.round((grade.score / grade.maxScore) * 100);
                  
                  return (
                    <motion.tr
                      key={grade.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-xs">
                              {student ? student.firstName.charAt(0) : "?"}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {student ? `${student.firstName} ${student.lastName}` : "Unknown"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{grade.subject}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{grade.assignmentName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {grade.score}/{grade.maxScore}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getGradeColor(grade.score, grade.maxScore)}>
                          {percentage}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {grade.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(grade.date), "MMM dd, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          onClick={() => handleDeleteGrade(grade.Id)}
                          className="p-2 text-error-600 hover:text-error-700 hover:bg-error-50"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Empty
          icon="BookOpen"
          title="No Grades Found"
          description={selectedStudent || selectedSubject 
            ? "No grades match your current filters. Try adjusting your selection or add new grades."
            : "You haven't added any grades yet. Start by adding grades for your students."
          }
          action={
            <Button
              variant="primary"
              onClick={() => setIsAddingGrade(true)}
            >
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Add Grade
            </Button>
          }
        />
      )}
    </div>
  );
};

export default Grades;