const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser');
const config = require('../config');
const logger = require('../utils/logger');

class StudentDataService {
    constructor() {
        this.dataDir = path.join(__dirname, '..', config.storage.dataDir);
        this.csvFilePath = path.join(this.dataDir, config.storage.csvFileName);        this.headers = [
            { id: 'id', title: 'ID' },
            { id: 'name', title: 'Name' },
            { id: 'email', title: 'Email' },
            { id: 'grade', title: 'Grade' },
            { id: 'createdAt', title: 'Created At' },
            { id: 'updatedAt', title: 'Updated At' }
        ];
        this.initialize();
    }

    initialize() {
        try {
            // Ensure data directory exists
            if (!fs.existsSync(this.dataDir)) {
                fs.mkdirSync(this.dataDir, { recursive: true });
                logger.info('Created data directory', { path: this.dataDir });
            }

            // Initialize CSV file with headers if it doesn't exist
            if (!fs.existsSync(this.csvFilePath)) {
                this.initializeCsvFile();
                logger.info('Initialized CSV file', { path: this.csvFilePath });
            }
        } catch (error) {
            logger.error('Failed to initialize data service', { error: error.message });
            throw new Error(`Data service initialization failed: ${error.message}`);
        }
    }

    initializeCsvFile() {
        const csvWriter = createCsvWriter({
            path: this.csvFilePath,
            header: this.headers
        });
        
        // Write empty data to create file with headers
        return csvWriter.writeRecords([]);
    }

    async addStudent(studentData) {
        try {
            const timestamp = new Date().toISOString();
            const student = {
                id: uuidv4(),
                name: studentData.name.trim(),
                email: studentData.email.trim().toLowerCase(),
                grade: studentData.grade.trim(),
                createdAt: timestamp,
                updatedAt: timestamp
            };

            // Check for duplicate email
            const existingStudents = await this.getAllStudents();
            const duplicateEmail = existingStudents.find(s => s.email === student.email);
            
            if (duplicateEmail) {
                throw new Error('A student with this email already exists');
            }

            const csvWriter = createCsvWriter({
                path: this.csvFilePath,
                header: this.headers,
                append: true
            });

            await csvWriter.writeRecords([student]);
            
            logger.info('Student added successfully', { 
                studentId: student.id, 
                email: student.email,
                grade: student.grade 
            });

            return student;
        } catch (error) {
            logger.error('Failed to add student', { 
                error: error.message,
                studentData: { ...studentData, email: studentData.email?.substring(0, 5) + '***' }
            });
            throw error;
        }
    }    async getAllStudents() {
        return new Promise((resolve, reject) => {
            try {
                if (!fs.existsSync(this.csvFilePath)) {
                    return resolve([]);
                }

                const students = [];
                
                fs.createReadStream(this.csvFilePath)
                    .pipe(csv())
                    .on('data', (data) => {
                        // Clean and validate data - skip empty rows
                        if (data.ID && data.Name && data.Email && data.ID.trim() !== '') {
                            students.push({
                                id: data.ID.trim(),
                                name: data.Name.trim(),
                                email: data.Email.trim(),
                                grade: data.Grade ? data.Grade.trim() : 'Unknown',
                                createdAt: data['Created At'] || data.createdAt || data.timestamp,
                                updatedAt: data['Updated At'] || data.updatedAt || data.timestamp
                            });
                        }
                    })
                    .on('end', () => {
                        logger.debug('Retrieved all students', { count: students.length });
                        resolve(students);
                    })
                    .on('error', (error) => {
                        logger.error('Failed to read students from CSV', { error: error.message });
                        reject(new Error(`Failed to read student data: ${error.message}`));
                    });
            } catch (error) {
                logger.error('Failed to get all students', { error: error.message });
                reject(error);
            }
        });
    }

    async getStudentById(id) {
        try {
            const students = await this.getAllStudents();
            const student = students.find(s => s.id === id);
            
            if (!student) {
                throw new Error('Student not found');
            }

            return student;
        } catch (error) {
            logger.error('Failed to get student by ID', { error: error.message, studentId: id });
            throw error;
        }
    }

    async getStudentsByGrade(grade) {
        try {
            const students = await this.getAllStudents();
            return students.filter(s => s.grade === grade);
        } catch (error) {
            logger.error('Failed to get students by grade', { error: error.message, grade });
            throw error;
        }
    }

    async searchStudents(searchTerm) {
        try {
            const students = await this.getAllStudents();
            const lowercaseSearch = searchTerm.toLowerCase();
            
            return students.filter(student => 
                student.name.toLowerCase().includes(lowercaseSearch) ||
                student.email.toLowerCase().includes(lowercaseSearch) ||
                student.grade.toLowerCase().includes(lowercaseSearch)
            );
        } catch (error) {
            logger.error('Failed to search students', { error: error.message, searchTerm });
            throw error;
        }
    }

    async getStudentStats() {
        try {
            const students = await this.getAllStudents();
            
            const stats = {
                totalStudents: students.length,
                gradeDistribution: {},
                recentStudents: students
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5),
                oldestStudent: null,
                newestStudent: null
            };

            // Calculate grade distribution
            students.forEach(student => {
                const grade = student.grade || 'Unknown';
                stats.gradeDistribution[grade] = (stats.gradeDistribution[grade] || 0) + 1;
            });

            // Find oldest and newest students
            if (students.length > 0) {
                const sortedByDate = students.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                stats.oldestStudent = sortedByDate[0];
                stats.newestStudent = sortedByDate[sortedByDate.length - 1];
            }

            return stats;
        } catch (error) {
            logger.error('Failed to get student statistics', { error: error.message });
            throw error;
        }
    }

    async deleteStudent(id) {
        try {
            const students = await this.getAllStudents();
            const studentIndex = students.findIndex(s => s.id === id);
            
            if (studentIndex === -1) {
                throw new Error('Student not found');
            }

            const deletedStudent = students[studentIndex];
            students.splice(studentIndex, 1);

            // Rewrite the entire CSV file
            const csvWriter = createCsvWriter({
                path: this.csvFilePath,
                header: this.headers
            });

            await csvWriter.writeRecords(students);
            
            logger.info('Student deleted successfully', { 
                studentId: id,
                email: deletedStudent.email 
            });

            return deletedStudent;
        } catch (error) {
            logger.error('Failed to delete student', { error: error.message, studentId: id });
            throw error;
        }
    }

    async updateStudent(id, updateData) {
        try {
            const students = await this.getAllStudents();
            const studentIndex = students.findIndex(s => s.id === id);
            
            if (studentIndex === -1) {
                throw new Error('Student not found');
            }

            // Check for duplicate email if email is being updated
            if (updateData.email && updateData.email !== students[studentIndex].email) {
                const duplicateEmail = students.find(s => s.email === updateData.email.toLowerCase() && s.id !== id);
                if (duplicateEmail) {
                    throw new Error('A student with this email already exists');
                }
            }

            // Update student data
            const updatedStudent = {
                ...students[studentIndex],
                ...updateData,
                email: updateData.email ? updateData.email.toLowerCase() : students[studentIndex].email,
                updatedAt: new Date().toISOString()
            };

            students[studentIndex] = updatedStudent;

            // Rewrite the entire CSV file
            const csvWriter = createCsvWriter({
                path: this.csvFilePath,
                header: this.headers
            });

            await csvWriter.writeRecords(students);
            
            logger.info('Student updated successfully', { 
                studentId: id,
                updatedFields: Object.keys(updateData)
            });

            return updatedStudent;
        } catch (error) {
            logger.error('Failed to update student', { error: error.message, studentId: id });
            throw error;
        }
    }
}

module.exports = new StudentDataService();
