export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'worker';
  phone?: string;
  address?: string;
  position?: string;
  salary?: number;
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface LanguageContextType {
  language: 'en' | 'fr' | 'ar';
  setLanguage: (lang: 'en' | 'fr' | 'ar') => void;
  t: (key: string) => string;
  isRTL: boolean;
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
  };
}

export interface AttendanceRecord {
  _id: string;
  userId: string;
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
  userId: string;
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
  userId: string;
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