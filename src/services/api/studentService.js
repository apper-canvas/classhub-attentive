import studentsData from "@/services/mockData/students.json";

class StudentService {
  constructor() {
    this.students = [...studentsData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.students];
  }

  async getById(id) {
    await this.delay(200);
    const student = this.students.find(s => s.Id === id);
    if (!student) {
      throw new Error("Student not found");
    }
    return { ...student };
  }

  async create(studentData) {
    await this.delay(400);
    const newStudent = {
      ...studentData,
      Id: Math.max(...this.students.map(s => s.Id)) + 1,
      enrollmentDate: new Date().toISOString(),
    };
    this.students.push(newStudent);
    return { ...newStudent };
  }

  async update(id, studentData) {
    await this.delay(300);
    const index = this.students.findIndex(s => s.Id === id);
    if (index === -1) {
      throw new Error("Student not found");
    }
    this.students[index] = { ...this.students[index], ...studentData };
    return { ...this.students[index] };
  }

  async delete(id) {
    await this.delay(200);
    const index = this.students.findIndex(s => s.Id === id);
    if (index === -1) {
      throw new Error("Student not found");
    }
    this.students.splice(index, 1);
    return true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const studentService = new StudentService();