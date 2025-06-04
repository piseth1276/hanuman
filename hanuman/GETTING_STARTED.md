# Student Management System - Getting Started

## Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation & Setup

1. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Start the Server**
   ```bash
   npm run dev
   ```
   or for production:
   ```bash
   npm start
   ```

3. **Access the Application**
   Open your browser and go to: `http://localhost:3001`

### What's Included

- **Backend (Node.js/Express)**: RESTful API server
- **Frontend (HTML/CSS/JS)**: Modern, responsive web interface
- **Data Storage**: CSV file-based storage (located in `server/data/students.csv`)

### Features

- ✅ Add new students with name, email, and grade
- ✅ View all students in a clean, organized list
- ✅ Real-time statistics dashboard
- ✅ Responsive design that works on mobile and desktop
- ✅ Data persistence in CSV format
- ✅ Input validation and error handling

### API Endpoints

- `GET /api/health` - Server health check
- `GET /api/students` - Get all students
- `POST /api/students` - Add a new student

### File Structure

```
/student-management-system
│
├── server/
│   ├── package.json
│   ├── server.js
│   └── data/
│       └── students.csv (auto-generated)
│
├── client/
│   └── index.html
│
├── .gitignore
└── README.md
```

### Next Steps

This is a basic foundation. You can extend it by:

1. **Adding Authentication**
   - User login/registration
   - Role-based access (Admin, Teacher, Student)

2. **Enhanced Features**
   - Edit/Delete students
   - Advanced search and filtering
   - File upload for student photos
   - Generate reports

3. **Database Integration**
   - Replace CSV with PostgreSQL/MySQL
   - Add proper data relationships

4. **Advanced Frontend**
   - Convert to React/Vue.js
   - Add state management
   - Implement routing

### Troubleshooting

- **Port already in use**: Change the PORT in server.js (default: 3001)
- **CSV file not created**: Check file permissions in the server/data directory
- **Cannot connect to server**: Ensure you're in the server directory when running npm commands
