const path = require('path');
require('dotenv').config();

const config = {
    // Server Configuration
    port: parseInt(process.env.PORT, 10) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // CORS Configuration
    corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:3001'],
    
    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
    },
    
    // File Storage Configuration
    storage: {
        dataDir: process.env.DATA_DIR || './data',
        csvFileName: process.env.CSV_FILE_NAME || 'students.csv',
        get csvFilePath() {
            return path.join(__dirname, this.dataDir, this.csvFileName);
        }
    },
    
    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        logDir: process.env.LOG_DIR || './logs'
    },
    
    // API Configuration
    api: {
        version: process.env.API_VERSION || 'v1',
        prefix: process.env.API_PREFIX || '/api'
    },
    
    // Validation Configuration
    validation: {
        maxNameLength: parseInt(process.env.MAX_NAME_LENGTH, 10) || 100,
        maxEmailLength: parseInt(process.env.MAX_EMAIL_LENGTH, 10) || 255,
        allowedGrades: process.env.ALLOWED_GRADES ? 
            process.env.ALLOWED_GRADES.split(',').map(grade => grade.trim()) : 
            ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade']
    },
    
    // Helper methods
    isDevelopment() {
        return this.nodeEnv === 'development';
    },
    
    isProduction() {
        return this.nodeEnv === 'production';
    }
};

module.exports = config;
