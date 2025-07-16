import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import StudentTable from "@/components/organisms/StudentTable";
import StudentModal from "@/components/organisms/StudentModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { studentService } from "@/services/api/studentService";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await studentService.getAll();
      setStudents(data);
      setFilteredStudents(data);
    } catch (err) {
      setError(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    let filtered = students;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(student => student.status === filterStatus);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, filterStatus]);

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (formData) => {
    try {
      if (selectedStudent) {
        await studentService.update(selectedStudent.Id, formData);
        toast.success("Student updated successfully!");
      } else {
        await studentService.create(formData);
        toast.success("Student added successfully!");
      }
      setIsModalOpen(false);
      loadStudents();
    } catch (err) {
      toast.error(err.message || "Failed to save student");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await studentService.delete(studentId);
        toast.success("Student deleted successfully!");
        loadStudents();
      } catch (err) {
        toast.error(err.message || "Failed to delete student");
      }
    }
  };

  const handleViewDetails = (student) => {
    // For now, just edit the student
    handleEditStudent(student);
  };

  if (loading) {
    return <Loading type="table" rows={8} />;
  }

  if (error) {
    return <Error message={error} onRetry={loadStudents} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Students
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your student roster and information
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddStudent}
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search students by name, email, or grade..."
            onSearch={setSearchTerm}
          />
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field py-2 px-3 w-40"
          >
            <option value="all">All Students</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="Users" className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-gray-800">
                {students.length}
              </p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-success-500 to-success-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="UserCheck" className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-gray-800">
                {students.filter(s => s.status === "active").length}
              </p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-warning-500 to-warning-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="UserMinus" className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-gray-800">
                {students.filter(s => s.status === "inactive").length}
              </p>
              <p className="text-sm text-gray-600">Inactive</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-error-500 to-error-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="UserX" className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-gray-800">
                {students.filter(s => s.status === "suspended").length}
              </p>
              <p className="text-sm text-gray-600">Suspended</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Students Table */}
      {filteredStudents.length > 0 ? (
        <StudentTable
          students={filteredStudents}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onViewDetails={handleViewDetails}
        />
      ) : (
        <Empty
          icon="Users"
          title="No Students Found"
          description={searchTerm || filterStatus !== "all" 
            ? "No students match your current filters. Try adjusting your search or filter criteria."
            : "You haven't added any students yet. Get started by adding your first student."
          }
          action={
            <Button
              variant="primary"
              onClick={handleAddStudent}
            >
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          }
        />
      )}

      {/* Student Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        onSave={handleSaveStudent}
        title={selectedStudent ? "Edit Student" : "Add New Student"}
      />
    </div>
  );
};

export default Students;