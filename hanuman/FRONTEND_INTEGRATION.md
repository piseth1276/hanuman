# Frontend Integration Guide for Bolt

## 🎯 **Quick Setup for Bolt**

### **1. Bolt Project Structure**
```
frontend/                   # Your Bolt-generated React app
├── src/
│   ├── components/        # React components
│   ├── services/         # API service files (create this)
│   ├── types/            # TypeScript types (create this)
│   ├── hooks/            # Custom React hooks (create this)
│   └── utils/            # Utility functions
├── package.json
└── vite.config.ts
```

### **2. Backend API Base URL**
Your backend runs on: `http://localhost:3001`

**Environment Variables for Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_TIMEOUT=10000
```

### **3. TypeScript Types to Define in Bolt**

```typescript
// types/student.ts
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

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalStudents: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    grade: string | null;
    search: string | null;
  };
}

export interface StudentStats {
  totalStudents: number;
  gradeDistribution: Record<string, number>;
  recentStudents: Student[];
  oldestStudent: Student | null;
  newestStudent: Student | null;
}

// types/api.ts
export interface QueryParams {
  page?: number;
  limit?: number;
  grade?: string;
  search?: string;
}

export const ALLOWED_GRADES = [
  'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade',
  '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade',
  '10th Grade', '11th Grade', '12th Grade'
] as const;

export type Grade = typeof ALLOWED_GRADES[number];
```

### **4. API Service Class to Create**

```typescript
// services/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  Student, 
  CreateStudentRequest, 
  UpdateStudentRequest,
  ApiResponse, 
  PaginatedResponse, 
  StudentStats,
  QueryParams 
} from '../types/student';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use((config) => {
      console.log(\`API Request: \${config.method?.toUpperCase()} \${config.url}\`);
      return config;
    });

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Student CRUD operations
  async getStudents(params?: QueryParams): Promise<PaginatedResponse<Student>> {
    const response = await this.api.get('/students', { params });
    return response.data;
  }

  async getStudentById(id: string): Promise<ApiResponse<Student>> {
    const response = await this.api.get(\`/students/\${id}\`);
    return response.data;
  }

  async createStudent(student: CreateStudentRequest): Promise<ApiResponse<Student>> {
    const response = await this.api.post('/students', student);
    return response.data;
  }

  async updateStudent(id: string, student: UpdateStudentRequest): Promise<ApiResponse<Student>> {
    const response = await this.api.put(\`/students/\${id}\`, student);
    return response.data;
  }

  async deleteStudent(id: string): Promise<ApiResponse<Student>> {
    const response = await this.api.delete(\`/students/\${id}\`);
    return response.data;
  }

  // Advanced queries
  async searchStudents(searchTerm: string): Promise<ApiResponse<Student[]>> {
    const response = await this.api.get('/students/search', { 
      params: { q: searchTerm } 
    });
    return response.data;
  }

  async getStudentsByGrade(grade: string): Promise<ApiResponse<Student[]>> {
    const response = await this.api.get(\`/students/grade/\${encodeURIComponent(grade)}\`);
    return response.data;
  }

  async getStudentStats(): Promise<ApiResponse<StudentStats>> {
    const response = await this.api.get('/students/stats');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
```

### **5. Custom React Hooks**

```typescript
// hooks/useStudents.ts
import { useState, useEffect } from 'react';
import { Student, QueryParams } from '../types/student';
import { apiService } from '../services/api';

export const useStudents = (params?: QueryParams) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getStudents(params);
      setStudents(response.data || []);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [JSON.stringify(params)]);

  return { students, loading, error, pagination, refetch: fetchStudents };
};

// hooks/useStudentStats.ts
import { useState, useEffect } from 'react';
import { StudentStats } from '../types/student';
import { apiService } from '../services/api';

export const useStudentStats = () => {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getStudentStats();
      setStats(response.data || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};
```

### **6. Utility Functions**

```typescript
// utils/validation.ts
import { ALLOWED_GRADES } from '../types/student';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 1 && name.trim().length <= 100;
};

export const validateGrade = (grade: string): boolean => {
  return ALLOWED_GRADES.includes(grade as any);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// utils/constants.ts
export const API_ENDPOINTS = {
  HEALTH: '/health',
  STUDENTS: '/students',
  STUDENT_STATS: '/students/stats',
  STUDENT_SEARCH: '/students/search',
  STUDENT_BY_GRADE: '/students/grade',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
} as const;
```

## 🔗 **Integration Steps**

### **1. Start Both Servers**
```bash
# Terminal 1: Backend
cd server
npm install
npm run dev

# Terminal 2: Frontend (Bolt)
cd frontend
npm run dev
```

### **2. Test Connection**
Add this to your main App component:
```typescript
useEffect(() => {
  apiService.healthCheck()
    .then(data => console.log('Backend connected:', data))
    .catch(err => console.error('Backend connection failed:', err));
}, []);
```

### **3. Package Dependencies for Bolt**
Tell Bolt to install these packages:
```json
{
  "axios": "^1.6.0",
  "@types/node": "^20.0.0"
}
```

## 🎨 **Component Examples for Bolt**

### **StudentForm Component**
```typescript
const StudentForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateStudentRequest>({
    name: '',
    email: '',
    grade: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createStudent(formData);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
    </form>
  );
};
```

This setup will give you a perfect foundation for integrating your Bolt frontend with the robust backend! 🚀
