const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { validateStudent, validateQueryParams } = require('../middlewares/validation');

// GET /api/students - Get all students with optional filtering and pagination
router.get('/', validateQueryParams, studentController.getAllStudents);

// GET /api/students/stats - Get student statistics
router.get('/stats', studentController.getStudentStats);

// GET /api/students/search - Search students
router.get('/search', studentController.searchStudents);

// GET /api/students/grade/:grade - Get students by grade
router.get('/grade/:grade', studentController.getStudentsByGrade);

// GET /api/students/:id - Get a single student by ID
router.get('/:id', studentController.getStudentById);

// POST /api/students - Create a new student
router.post('/', validateStudent, studentController.createStudent);

// PUT /api/students/:id - Update a student
router.put('/:id', validateStudent, studentController.updateStudent);

// DELETE /api/students/:id - Delete a student
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
