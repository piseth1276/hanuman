const Joi = require('joi');
const config = require('../config');

// Student validation schema
const studentSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(1)
        .max(config.validation.maxNameLength)
        .required()
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 1 character long',
            'string.max': `Name must be less than ${config.validation.maxNameLength} characters`,
            'any.required': 'Name is required'
        }),
    
    email: Joi.string()
        .trim()
        .email()
        .max(config.validation.maxEmailLength)
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.max': `Email must be less than ${config.validation.maxEmailLength} characters`,
            'any.required': 'Email is required'
        }),
    
    grade: Joi.string()
        .trim()
        .valid(...config.validation.allowedGrades)
        .required()
        .messages({
            'any.only': `Grade must be one of: ${config.validation.allowedGrades.join(', ')}`,
            'any.required': 'Grade is required'
        })
});

// Validation middleware
const validateStudent = (req, res, next) => {
    const { error, value } = studentSchema.validate(req.body, {
        abortEarly: false, // Return all validation errors
        stripUnknown: true // Remove unknown fields
    });

    if (error) {
        const errorMessages = error.details.map(detail => ({
            field: detail.path[0],
            message: detail.message
        }));

        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errorMessages
        });
    }

    // Replace request body with validated and sanitized data
    req.body = value;
    next();
};

// Query parameter validation
const validateQueryParams = (req, res, next) => {
    const querySchema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        grade: Joi.string().trim().valid(...config.validation.allowedGrades),
        search: Joi.string().trim().max(100)
    });

    const { error, value } = querySchema.validate(req.query, {
        stripUnknown: true
    });

    if (error) {
        return res.status(400).json({
            success: false,
            error: 'Invalid query parameters',
            details: error.details.map(detail => detail.message)
        });
    }

    req.query = value;
    next();
};

module.exports = {
    validateStudent,
    validateQueryParams,
    studentSchema
};
