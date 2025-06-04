const express = require('express');
const router = express.Router();
const studentRoutes = require('./students');

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Student Management System API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
    const endpoints = {
        health: 'GET /api/health - Health check',
        students: {
            base: 'Students API endpoints:',
            getAll: 'GET /api/students?page=1&limit=10&grade=&search= - Get all students with optional filtering',
            getById: 'GET /api/students/:id - Get student by ID',
            create: 'POST /api/students - Create new student (requires: name, email, grade)',
            update: 'PUT /api/students/:id - Update student',
            delete: 'DELETE /api/students/:id - Delete student',
            stats: 'GET /api/students/stats - Get student statistics',
            search: 'GET /api/students/search?q=searchTerm - Search students',
            byGrade: 'GET /api/students/grade/:grade - Get students by grade'
        }
    };

    res.json({
        success: true,
        message: 'Student Management System API Documentation',
        version: '1.0.0',
        endpoints
    });
});

// Mount student routes
router.use('/students', studentRoutes);

module.exports = router;
