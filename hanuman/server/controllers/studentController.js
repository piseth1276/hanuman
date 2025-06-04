const studentService = require('../services/studentService');
const logger = require('../utils/logger');

class StudentController {
    // Get all students with optional filtering and pagination
    async getAllStudents(req, res) {
        try {
            const { page = 1, limit = 10, grade, search } = req.query;
            
            let students = await studentService.getAllStudents();

            // Apply filters
            if (grade) {
                students = students.filter(student => student.grade === grade);
            }

            if (search) {
                students = await studentService.searchStudents(search);
            }

            // Apply pagination
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedStudents = students.slice(startIndex, endIndex);

            const response = {
                success: true,
                data: paginatedStudents,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(students.length / limit),
                    totalStudents: students.length,
                    hasNextPage: endIndex < students.length,
                    hasPrevPage: page > 1
                },
                filters: {
                    grade: grade || null,
                    search: search || null
                }
            };

            res.json(response);
        } catch (error) {
            logger.error('Error getting students', { error: error.message, query: req.query });
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve students',
                message: error.message
            });
        }
    }

    // Get a single student by ID
    async getStudentById(req, res) {
        try {
            const { id } = req.params;
            const student = await studentService.getStudentById(id);

            res.json({
                success: true,
                data: student
            });
        } catch (error) {
            logger.error('Error getting student by ID', { error: error.message, studentId: req.params.id });
            
            if (error.message === 'Student not found') {
                return res.status(404).json({
                    success: false,
                    error: 'Student not found',
                    message: `No student found with ID: ${req.params.id}`
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to retrieve student',
                message: error.message
            });
        }
    }

    // Create a new student
    async createStudent(req, res) {
        try {
            const student = await studentService.addStudent(req.body);

            res.status(201).json({
                success: true,
                message: 'Student created successfully',
                data: student
            });
        } catch (error) {
            logger.error('Error creating student', { error: error.message, studentData: req.body });
            
            if (error.message.includes('email already exists')) {
                return res.status(409).json({
                    success: false,
                    error: 'Duplicate email',
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to create student',
                message: error.message
            });
        }
    }

    // Update a student
    async updateStudent(req, res) {
        try {
            const { id } = req.params;
            const updatedStudent = await studentService.updateStudent(id, req.body);

            res.json({
                success: true,
                message: 'Student updated successfully',
                data: updatedStudent
            });
        } catch (error) {
            logger.error('Error updating student', { error: error.message, studentId: req.params.id });
            
            if (error.message === 'Student not found') {
                return res.status(404).json({
                    success: false,
                    error: 'Student not found',
                    message: `No student found with ID: ${req.params.id}`
                });
            }

            if (error.message.includes('email already exists')) {
                return res.status(409).json({
                    success: false,
                    error: 'Duplicate email',
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to update student',
                message: error.message
            });
        }
    }

    // Delete a student
    async deleteStudent(req, res) {
        try {
            const { id } = req.params;
            const deletedStudent = await studentService.deleteStudent(id);

            res.json({
                success: true,
                message: 'Student deleted successfully',
                data: deletedStudent
            });
        } catch (error) {
            logger.error('Error deleting student', { error: error.message, studentId: req.params.id });
            
            if (error.message === 'Student not found') {
                return res.status(404).json({
                    success: false,
                    error: 'Student not found',
                    message: `No student found with ID: ${req.params.id}`
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to delete student',
                message: error.message
            });
        }
    }

    // Get students by grade
    async getStudentsByGrade(req, res) {
        try {
            const { grade } = req.params;
            const students = await studentService.getStudentsByGrade(grade);

            res.json({
                success: true,
                data: students,
                count: students.length,
                grade: grade
            });
        } catch (error) {
            logger.error('Error getting students by grade', { error: error.message, grade: req.params.grade });
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve students by grade',
                message: error.message
            });
        }
    }

    // Get student statistics
    async getStudentStats(req, res) {
        try {
            const stats = await studentService.getStudentStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            logger.error('Error getting student statistics', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve student statistics',
                message: error.message
            });
        }
    }

    // Search students
    async searchStudents(req, res) {
        try {
            const { q: searchTerm } = req.query;
            
            if (!searchTerm || searchTerm.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Search term is required',
                    message: 'Please provide a search term using the "q" query parameter'
                });
            }

            const students = await studentService.searchStudents(searchTerm.trim());

            res.json({
                success: true,
                data: students,
                count: students.length,
                searchTerm: searchTerm.trim()
            });
        } catch (error) {
            logger.error('Error searching students', { error: error.message, searchTerm: req.query.q });
            res.status(500).json({
                success: false,
                error: 'Failed to search students',
                message: error.message
            });
        }
    }
}

module.exports = new StudentController();
