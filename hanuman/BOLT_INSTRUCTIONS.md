# 🚀 **BOLT INSTRUCTIONS - Student Management System Frontend**

## **📋 Project Setup Instructions for Bolt**

### **1. Initial Prompt for Bolt**
```
Create a modern React TypeScript frontend for a Student Management System with the following requirements:

- **Tech Stack**: React 18 + TypeScript + Vite + TailwindCSS + Lucide React icons + React Router
- **Purpose**: Frontend for managing student data (CRUD operations)
- **API**: REST API backend at http://localhost:3001/api
- **Design**: Modern, responsive design with cards, gradients, and smooth animations
- **Pages**: Dashboard, Students List, Add Student, Student Details, Statistics
```

### **2. Project Structure to Request**
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── students/        # Student-specific components
├── pages/               # Page components
├── services/            # API services
├── hooks/               # Custom React hooks
├── types/               # TypeScript interfaces
├── utils/               # Utility functions
└── App.tsx
```

### **3. Dependencies to Install**
Tell Bolt to install these packages:
```json
{
  "axios": "^1.6.0",
  "react-router-dom": "^6.20.0",
  "lucide-react": "^0.294.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0",
  "@types/node": "^20.0.0"
}
```

### **4. API Integration Code**

#### **Environment Setup**
Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_TIMEOUT=10000
```

#### **TypeScript Types** (`src/types/student.ts`)
```typescript
export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentRequest {
  name: string;
  email: string;
  grade: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalStudents: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const ALLOWED_GRADES = [
  'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade',
  '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade',
  '10th Grade', '11th Grade', '12th Grade'
] as const;

export type Grade = typeof ALLOWED_GRADES[number];
```

#### **API Service** (`src/services/api.ts`)
```typescript
import axios from 'axios';
import { Student, CreateStudentRequest, ApiResponse, PaginatedResponse } from '../types/student';

class ApiService {
  private api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  async getStudents(params?: any): Promise<PaginatedResponse<Student>> {
    const response = await this.api.get('/students', { params });
    return response.data;
  }

  async createStudent(student: CreateStudentRequest): Promise<ApiResponse<Student>> {
    const response = await this.api.post('/students', student);
    return response.data;
  }

  async getStudentById(id: string): Promise<ApiResponse<Student>> {
    const response = await this.api.get(`/students/${id}`);
    return response.data;
  }

  async updateStudent(id: string, student: Partial<CreateStudentRequest>): Promise<ApiResponse<Student>> {
    const response = await this.api.put(`/students/${id}`, student);
    return response.data;
  }

  async deleteStudent(id: string): Promise<ApiResponse<Student>> {
    const response = await this.api.delete(`/students/${id}`);
    return response.data;
  }

  async getStudentStats(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/students/stats');
    return response.data;
  }
}

export const apiService = new ApiService();
```

#### **Custom Hook** (`src/hooks/useStudents.ts`)
```typescript
import { useState, useEffect } from 'react';
import { Student } from '../types/student';
import { apiService } from '../services/api';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStudents();
      setStudents(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return { students, loading, error, refetch: fetchStudents };
};
```

### **5. Pages to Create**

#### **Dashboard Page** - Overview with stats cards
#### **Students List Page** - Table/cards with search, filter, pagination
#### **Add Student Page** - Form with validation
#### **Student Details Page** - Individual student view with edit/delete
#### **Statistics Page** - Charts and analytics

### **6. Component Requirements**

#### **UI Components to Build:**
- `Button` - Various styles (primary, secondary, danger)
- `Input` - Form input with validation states
- `Select` - Dropdown for grade selection
- `Card` - Container component
- `LoadingSpinner` - Loading indicator
- `ErrorMessage` - Error display component
- `Pagination` - Page navigation
- `SearchBar` - Search functionality

#### **Layout Components:**
- `Header` - Navigation and title
- `Sidebar` - Navigation menu
- `Layout` - Main page wrapper

#### **Student Components:**
- `StudentCard` - Individual student display
- `StudentForm` - Add/edit student form
- `StudentList` - List of students
- `StudentStats` - Statistics display

### **7. Design Guidelines**

#### **Color Scheme:**
- Primary: Blue gradient (#667eea to #764ba2)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Error: Red (#ef4444)
- Gray: Various shades for text and backgrounds

#### **Design Elements:**
- Card-based layout with shadows
- Rounded corners (8px default)
- Smooth transitions and hover effects
- Responsive grid layouts
- Icons from Lucide React
- Clean typography with good contrast

### **8. Functionality Requirements**

#### **Core Features:**
- ✅ View all students in a responsive grid/table
- ✅ Add new students with form validation
- ✅ Edit existing student information
- ✅ Delete students with confirmation
- ✅ Search students by name, email, or grade
- ✅ Filter students by grade
- ✅ Pagination for large datasets
- ✅ Statistics dashboard with charts
- ✅ Responsive design for mobile/tablet

#### **Form Validation:**
- Name: Required, 1-100 characters
- Email: Required, valid email format, unique
- Grade: Required, must be from allowed list

#### **Error Handling:**
- API connection errors
- Validation errors
- Network timeouts
- User-friendly error messages

### **9. Router Setup**
```typescript
// App.tsx routes
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/students" element={<StudentsList />} />
  <Route path="/students/add" element={<AddStudent />} />
  <Route path="/students/:id" element={<StudentDetails />} />
  <Route path="/statistics" element={<Statistics />} />
</Routes>
```

### **10. State Management**
Use React Context or simple state management with hooks. No need for Redux for this project size.

---

## **🔥 Pro Tips for Bolt**

1. **Start Small**: Begin with the basic structure and API integration
2. **Test Connection**: Add a health check to verify backend connectivity
3. **Mock Data**: Use sample data while building UI, then connect to API
4. **Responsive First**: Design for mobile, then scale up
5. **Error Boundaries**: Add error handling for better UX
6. **Loading States**: Show loading spinners during API calls
7. **Validation**: Client-side validation + server-side error handling

## **🚦 Development Flow**

1. **Setup** → Project structure + dependencies
2. **API** → Service layer + types + hooks
3. **UI** → Basic components + layout
4. **Pages** → Individual page components
5. **Integration** → Connect components to API
6. **Polish** → Animations, error handling, responsive design
7. **Testing** → Manual testing with backend running

This setup will give you a production-ready frontend that integrates perfectly with your robust backend! 🎯
