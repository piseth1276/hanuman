const logger = require('../utils/logger');
const config = require('../config');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Default error
    let error = {
        success: false,
        error: 'Internal Server Error',
        message: 'Something went wrong on our end'
    };

    // Validation errors
    if (err.name === 'ValidationError') {
        error = {
            success: false,
            error: 'Validation Error',
            message: err.message,
            details: err.details || []
        };
        return res.status(400).json(error);
    }

    // JSON parsing errors
    if (err.type === 'entity.parse.failed') {
        error = {
            success: false,
            error: 'Invalid JSON',
            message: 'Request body contains invalid JSON'
        };
        return res.status(400).json(error);
    }

    // File system errors
    if (err.code === 'ENOENT') {
        error = {
            success: false,
            error: 'File Not Found',
            message: 'Required data file not found'
        };
        return res.status(500).json(error);
    }

    if (err.code === 'EACCES') {
        error = {
            success: false,
            error: 'Permission Denied',
            message: 'Insufficient permissions to access data file'
        };
        return res.status(500).json(error);
    }

    // Rate limiting errors
    if (err.status === 429) {
        error = {
            success: false,
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.'
        };
        return res.status(429).json(error);
    }

    // Include stack trace in development
    if (config.isDevelopment()) {
        error.stack = err.stack;
    }

    // Send error response
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json(error);
};

// 404 handler
const notFoundHandler = (req, res) => {
    logger.warn('Route not found', {
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.method} ${req.url} not found`,
        availableEndpoints: {
            health: 'GET /api/health',
            docs: 'GET /api/docs',
            students: 'GET /api/students'
        }
    });
};

// Async error handler wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
