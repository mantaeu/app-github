export interface User {
  _id: string;
  idCardNumber: string;
  name: string;
  email?: string;
  role: 'admin' | 'worker';
  phone?: string;
  address?: string;
  position?: string;
  department?: string;
  salary?: number;
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (idCardNumber: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colors: {
    primary: string;
    background: string;
    text: string;
    secondary: string;
    accent: string;
    border: string;
    card: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface AttendanceRecord {
  _id: string;
  userId: string | User;
  date: string;
  checkIn?: string;
  checkOut?: string;
  hoursWorked: number;
  overtime: number;
  status: 'present' | 'absent' | 'late';
  autoMarked?: boolean;
  notes?: string;
}

export interface SalaryRecord {
  _id: string;
  userId: string | User;
  month: string;
  year: number;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  totalSalary: number;
  isPaid: boolean;
  paidAt?: string;
  presentDays?: number;
  absentDays?: number;
  totalWorkingDays?: number;
  totalHoursWorked?: number;
  notes?: string;
}

export interface Receipt {
  _id: string;
  userId: string | User;
  type: 'salary' | 'payment' | 'invoice';
  amount: number;
  description: string;
  date: string;
  pdfUrl?: string;
  metadata?: any;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}