# Student Management System API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Currently, no authentication is required. This is planned for future versions.

## Error Responses
All error responses follow this format:
```json
{
    "success": false,
    "error": "Error Type",
    "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Endpoints

### Health Check
Check if the API is running.

**GET** `/health`

**Response:**
```json
{
    "success": true,
    "message": "Student Management System API is running",
    "version": "1.0.0",
    "timestamp": "2025-06-04T12:00:00.000Z",
    "uptime": 3600,
    "environment": "development"
}
```

### Get All Students
Retrieve all students with optional filtering and pagination.

**GET** `/students`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Number of students per page
- `grade` (string) - Filter by grade
- `search` (string) - Search in name, email, or grade

**Examples:**
```
GET /api/students
GET /api/students?page=2&limit=5
GET /api/students?grade=5th Grade
GET /api/students?search=john
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid-string",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "grade": "5th Grade",
            "createdAt": "2025-06-04T12:00:00.000Z",
            "updatedAt": "2025-06-04T12:00:00.000Z"
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 3,
        "totalStudents": 25,
        "hasNextPage": true,
        "hasPrevPage": false
    },
    "filters": {
        "grade": null,
        "search": null
    }
}
```

### Get Student by ID
Retrieve a specific student by their ID.

**GET** `/students/:id`

**Response:**
```json
{
    "success": true,
    "data": {
        "id": "uuid-string",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "grade": "5th Grade",
        "createdAt": "2025-06-04T12:00:00.000Z",
        "updatedAt": "2025-06-04T12:00:00.000Z"
    }
}
```

### Create Student
Add a new student.

**POST** `/students`

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "grade": "5th Grade"
}
```

**Validation Rules:**
- `name`: Required, 1-100 characters
- `email`: Required, valid email format, max 255 characters, must be unique
- `grade`: Required, must be one of the allowed grades

**Response (201):**
```json
{
    "success": true,
    "message": "Student created successfully",
    "data": {
        "id": "uuid-string",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "grade": "5th Grade",
        "createdAt": "2025-06-04T12:00:00.000Z",
        "updatedAt": "2025-06-04T12:00:00.000Z"
    }
}
```

### Update Student
Update an existing student.

**PUT** `/students/:id`

**Request Body:**
```json
{
    "name": "John Smith",
    "email": "john.smith@example.com",
    "grade": "6th Grade"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Student updated successfully",
    "data": {
        "id": "uuid-string",
        "name": "John Smith",
        "email": "john.smith@example.com",
        "grade": "6th Grade",
        "createdAt": "2025-06-04T12:00:00.000Z",
        "updatedAt": "2025-06-04T12:30:00.000Z"
    }
}
```

### Delete Student
Remove a student from the system.

**DELETE** `/students/:id`

**Response:**
```json
{
    "success": true,
    "message": "Student deleted successfully",
    "data": {
        "id": "uuid-string",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "grade": "5th Grade",
        "createdAt": "2025-06-04T12:00:00.000Z",
        "updatedAt": "2025-06-04T12:00:00.000Z"
    }
}
```

### Get Students by Grade
Retrieve all students in a specific grade.

**GET** `/students/grade/:grade`

**Example:**
```
GET /api/students/grade/5th Grade
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid-string",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "grade": "5th Grade",
            "createdAt": "2025-06-04T12:00:00.000Z",
            "updatedAt": "2025-06-04T12:00:00.000Z"
        }
    ],
    "count": 1,
    "grade": "5th Grade"
}
```

### Search Students
Search for students by name, email, or grade.

**GET** `/students/search?q=searchTerm`

**Query Parameters:**
- `q` (string, required) - Search term

**Example:**
```
GET /api/students/search?q=john
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid-string",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "grade": "5th Grade",
            "createdAt": "2025-06-04T12:00:00.000Z",
            "updatedAt": "2025-06-04T12:00:00.000Z"
        }
    ],
    "count": 1,
    "searchTerm": "john"
}
```

### Get Student Statistics
Retrieve system-wide student statistics.

**GET** `/students/stats`

**Response:**
```json
{
    "success": true,
    "data": {
        "totalStudents": 150,
        "gradeDistribution": {
            "Kindergarten": 20,
            "1st Grade": 25,
            "2nd Grade": 22,
            "3rd Grade": 18,
            "4th Grade": 20,
            "5th Grade": 23,
            "6th Grade": 22
        },
        "recentStudents": [
            {
                "id": "uuid-string",
                "name": "Jane Smith",
                "email": "jane.smith@example.com",
                "grade": "3rd Grade",
                "createdAt": "2025-06-04T11:45:00.000Z",
                "updatedAt": "2025-06-04T11:45:00.000Z"
            }
        ],
        "oldestStudent": {
            "id": "uuid-string",
            "name": "First Student",
            "email": "first@example.com",
            "grade": "5th Grade",
            "createdAt": "2025-01-01T09:00:00.000Z",
            "updatedAt": "2025-01-01T09:00:00.000Z"
        },
        "newestStudent": {
            "id": "uuid-string",
            "name": "Latest Student",
            "email": "latest@example.com",
            "grade": "2nd Grade",
            "createdAt": "2025-06-04T11:45:00.000Z",
            "updatedAt": "2025-06-04T11:45:00.000Z"
        }
    }
}
```

## Allowed Grades
```
Kindergarten, 1st Grade, 2nd Grade, 3rd Grade, 4th Grade, 5th Grade, 
6th Grade, 7th Grade, 8th Grade, 9th Grade, 10th Grade, 11th Grade, 12th Grade
```

## Rate Limiting
- **Window:** 15 minutes
- **Max Requests:** 100 per window per IP
- **Headers:** Rate limit information is included in response headers

## Data Storage
- Data is currently stored in CSV format at `server/data/students.csv`
- Each student gets a unique UUID as identifier
- Email addresses must be unique across all students
- All timestamps are in ISO 8601 format (UTC)

## Future Enhancements
- Authentication with JWT tokens
- Role-based access control (Admin, Teacher, Student)
- File upload capabilities for student photos/documents
- Database integration (PostgreSQL/MySQL)
- Real-time notifications
- Advanced reporting and analytics
