import { ApiResponse, User, AttendanceRecord, SalaryRecord, Receipt } from '../types';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
const API_BASE_URL = 'https://app-github-sbnv-meeeeee.vercel.app/api';

class ApiService {
  private authToken: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `Request failed with status ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Helper method to download and save PDF
  private async downloadPDF(blob: Blob, filename: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web platform - create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Mobile platform - save to file system and share
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          const fileUri = `${FileSystem.documentDirectory}${filename}`;
          
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
          }
        };
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  }

  // Authentication
  async login(idCardNumber: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ idCardNumber }),
    });
  }

  async adminLogin(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Users
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request('/users');
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.request(`/users/${id}`);
  }

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Attendance
  async getAttendance(userId?: string): Promise<ApiResponse<AttendanceRecord[]>> {
    const endpoint = userId ? `/attendance?userId=${userId}` : '/attendance';
    return this.request(endpoint);
  }

  async createAttendance(attendanceData: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceRecord>> {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async updateAttendance(id: string, attendanceData: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceRecord>> {
    return this.request(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(attendanceData),
    });
  }

  async deleteAttendance(id: string): Promise<ApiResponse<void>> {
    return this.request(`/attendance/${id}`, {
      method: 'DELETE',
    });
  }

  // Salary
  async getSalaryRecords(userId?: string): Promise<ApiResponse<SalaryRecord[]>> {
    const endpoint = userId ? `/salary?userId=${userId}` : '/salary';
    return this.request(endpoint);
  }

  async createSalaryRecord(salaryData: Partial<SalaryRecord>): Promise<ApiResponse<SalaryRecord>> {
    return this.request('/salary', {
      method: 'POST',
      body: JSON.stringify(salaryData),
    });
  }

  async updateSalaryRecord(id: string, salaryData: Partial<SalaryRecord>): Promise<ApiResponse<SalaryRecord>> {
    return this.request(`/salary/${id}`, {
      method: 'PUT',
      body: JSON.stringify(salaryData),
    });
  }

  async markSalaryAsPaid(id: string): Promise<ApiResponse<SalaryRecord>> {
    return this.request(`/salary/${id}/pay`, {
      method: 'PUT',
    });
  }

  // Receipts
  async getReceipts(userId?: string): Promise<ApiResponse<Receipt[]>> {
    const endpoint = userId ? `/receipts?userId=${userId}` : '/receipts';
    return this.request(endpoint);
  }

  async createReceipt(receiptData: Partial<Receipt>): Promise<ApiResponse<Receipt>> {
    return this.request('/receipts', {
      method: 'POST',
      body: JSON.stringify(receiptData),
    });
  }

  async generateSalarySlip(userId: string, month: string, year: number): Promise<ApiResponse<{ pdfUrl: string }>> {
    return this.request('/receipts/salary-slip', {
      method: 'POST',
      body: JSON.stringify({ userId, month, year }),
    });
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<{
    totalUsers: number;
    monthlyAttendance: number;
    pendingSalaries: number;
    recentActivity: any[];
  }>> {
    return this.request('/dashboard/stats');
  }

  // Enhanced Attendance Methods
  async markAbsentWorkers(): Promise<ApiResponse<void>> {
    return this.request('/attendance/mark-absent', {
      method: 'POST',
    });
  }

  async getMonthlyAttendanceReport(userId: string, month: string, year: number): Promise<ApiResponse<any>> {
    return this.request(`/attendance/monthly-report/${userId}/${month}/${year}`);
  }

  // Enhanced Salary Methods
  async generateMonthlySalaries(month: string, year: number): Promise<ApiResponse<void>> {
    return this.request(`/salary/generate-monthly/${month}/${year}`, {
      method: 'POST',
    });
  }

  async checkoutMonthlySalary(userId: string, month: string, year: number): Promise<ApiResponse<{
    salaryRecord: any;
    receipt: any;
  }>> {
    return this.request(`/salary/checkout/${userId}/${month}/${year}`, {
      method: 'POST',
    });
  }

  // Individual PDF download methods (for download buttons in each salary/receipt card)
  async downloadIndividualSalarySlipPDF(salaryId: string, language: string = 'en'): Promise<void> {
    const url = `${API_BASE_URL}/pdf/salary-slip/${salaryId}?lang=${language}`;
    
    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to download salary slip PDF: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const filename = `salary-slip-${salaryId}-${language}.pdf`;
    await this.downloadPDF(blob, filename);
  }

  async downloadIndividualReceiptPDF(receiptId: string, language: string = 'en'): Promise<void> {
    const url = `${API_BASE_URL}/pdf/receipt/${receiptId}?lang=${language}`;
    
    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to download receipt PDF: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const filename = `receipt-${receiptId}-${language}.pdf`;
    await this.downloadPDF(blob, filename);
  }

  // Export Methods for Salary and Receipts screens (admin bulk export)
  async exportAllSalariesPDF(language: string = 'en'): Promise<void> {
    const url = `${API_BASE_URL}/pdf/all-salaries?lang=${language}`;
    
    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to export salaries PDF: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const filename = `all-salaries-${new Date().toISOString().split('T')[0]}-${language}.pdf`;
    await this.downloadPDF(blob, filename);
  }

  async exportAllReceiptsPDF(language: string = 'en'): Promise<void> {
    const url = `${API_BASE_URL}/pdf/all-receipts?lang=${language}`;
    
    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to export receipts PDF: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const filename = `all-receipts-${new Date().toISOString().split('T')[0]}-${language}.pdf`;
    await this.downloadPDF(blob, filename);
  }

  // Invoice/Quote Management
  async getInvoices(params?: {
    page?: number;
    limit?: number;
    type?: 'devis' | 'facture';
    status?: string;
    clientName?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    invoices: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/invoices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getInvoiceById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/invoices/${id}`);
  }

  async createInvoice(invoiceData: {
    type: 'devis' | 'facture';
    clientName: string;
    clientEmail?: string;
    clientAddress?: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    taxRate?: number;
    discount?: number;
    notes?: string;
    dueDate?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async updateInvoice(id: string, invoiceData: Partial<{
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    taxRate: number;
    discount: number;
    notes: string;
    dueDate: string;
    status: string;
  }>): Promise<ApiResponse<any>> {
    return this.request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    });
  }

  async deleteInvoice(id: string): Promise<ApiResponse<void>> {
    return this.request(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  async markInvoiceAsPaid(id: string): Promise<ApiResponse<any>> {
    return this.request(`/invoices/${id}/mark-paid`, {
      method: 'PATCH',
    });
  }

  async convertDevisToFacture(id: string): Promise<ApiResponse<any>> {
    return this.request(`/invoices/${id}/convert-to-facture`, {
      method: 'POST',
    });
  }

  async getInvoiceStats(): Promise<ApiResponse<{
    totalDevis: number;
    totalFactures: number;
    paidFactures: number;
    pendingFactures: number;
    totalRevenue: number;
    thisMonthRevenue: number;
  }>> {
    return this.request('/invoices/stats/overview');
  }
}

export const apiService = new ApiService();