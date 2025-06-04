const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

// Import configuration and utilities
const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Import routes
const apiRoutes = require('./routes');

// Create Express application
const app = express();

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        success: false,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Request logging
if (config.isDevelopment()) {
    app.use(morgan('dev'));
}
app.use(logger.requestLogger());

// Body parsing middleware
app.use(express.json({ 
    limit: '10mb',
    strict: true
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
}));

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client'), {
    maxAge: config.isDevelopment() ? 0 : '1d',
    etag: true
}));

// API routes
app.use(config.api.prefix, apiRoutes);

// Root endpoint - serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// 404 handler for unknown routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', {
        reason: reason?.message || reason,
        stack: reason?.stack
    });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
    });
    process.exit(1);
});

// Start server
const server = app.listen(config.port, () => {
    logger.info('Student Management System Server Started', {
        port: config.port,
        environment: config.nodeEnv,
        corsOrigin: config.corsOrigin,
        csvPath: config.storage.csvFilePath
    });
    
    if (config.isDevelopment()) {
        console.log(`
╭─────────────────────────────────────────────────╮
│  🎓 Student Management System API Server        │
│                                                 │
│  🌐 Server: http://localhost:${config.port}              │
│  📊 Health: http://localhost:${config.port}/api/health  │
│  📚 Docs:   http://localhost:${config.port}/api/docs    │
│  🗃️  Data:   ${config.storage.csvFilePath.substring(0, 30)}... │
│                                                 │
│  Press Ctrl+C to stop the server               │
╰─────────────────────────────────────────────────╯
        `);
    }
});

// Export app for testing
module.exports = { app, server };
