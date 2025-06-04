const fs = require('fs');
const path = require('path');
const config = require('../config');

class Logger {
    constructor() {
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        const logDir = path.join(__dirname, '..', config.logging.logDir);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        this.logFilePath = path.join(logDir, 'app.log');
        this.errorLogFilePath = path.join(logDir, 'error.log');
    }

    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const metaString = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaString}\n`;
    }

    writeToFile(filePath, message) {
        fs.appendFileSync(filePath, message);
    }

    log(level, message, meta = {}) {
        const formattedMessage = this.formatMessage(level, message, meta);
        
        // Write to appropriate log file
        this.writeToFile(this.logFilePath, formattedMessage);
        
        // Write errors to separate error log
        if (level === 'error') {
            this.writeToFile(this.errorLogFilePath, formattedMessage);
        }

        // Console output in development
        if (config.isDevelopment()) {
            const colors = {
                error: '\x1b[31m',   // Red
                warn: '\x1b[33m',    // Yellow
                info: '\x1b[36m',    // Cyan
                debug: '\x1b[35m',   // Magenta
                reset: '\x1b[0m'     // Reset
            };

            const color = colors[level] || colors.info;
            console.log(`${color}${formattedMessage.trim()}${colors.reset}`);
        }
    }

    info(message, meta = {}) {
        this.log('info', message, meta);
    }

    error(message, meta = {}) {
        this.log('error', message, meta);
    }

    warn(message, meta = {}) {
        this.log('warn', message, meta);
    }

    debug(message, meta = {}) {
        if (config.isDevelopment()) {
            this.log('debug', message, meta);
        }
    }

    // Express middleware for request logging
    requestLogger() {
        return (req, res, next) => {
            const start = Date.now();
            
            res.on('finish', () => {
                const duration = Date.now() - start;
                const logData = {
                    method: req.method,
                    url: req.url,
                    status: res.statusCode,
                    duration: `${duration}ms`,
                    userAgent: req.get('User-Agent'),
                    ip: req.ip || req.connection.remoteAddress
                };

                if (res.statusCode >= 400) {
                    this.warn(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
                } else {
                    this.info(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
                }
            });

            next();
        };
    }
}

module.exports = new Logger();
