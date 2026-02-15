import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type {
  ApiResponse,
  AuthResponse,
  User,
  QuestionSet,
  ModuleMetadata,
  Interview,
  InterviewStatus,
  StartInterviewRequest,
  SaveAnswerRequest,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
    if (this.token) {
      this.setAuthToken(this.token);
    }

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  setAuthToken(token: string) {
    this.token = token;
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('auth_token', token);
  }

  clearAuth() {
    this.token = null;
    delete this.api.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Authentication endpoints
  async register(data: {
    email: string;
    password: string;
    name?: string;
    securityQuestion: string;
    securityAnswer: string;
  }): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/api/auth/register', data);
    if (response.data.success && response.data.data.token) {
      this.setAuthToken(response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    if (response.data.success && response.data.data.token) {
      this.setAuthToken(response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.isAuthenticated()) return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  logout() {
    this.clearAuth();
    window.location.href = '/login';
  }

  // Interview question endpoints (public)
  async getLiteQuestions(): Promise<ApiResponse<{
    interviewType: 'lite';
    estimatedMinutes: number;
    categories: QuestionSet[];
    totalQuestions: number;
  }>> {
    const response = await this.api.get('/api/interviews/questions/lite');
    return response.data;
  }

  async getDeepModulesMetadata(): Promise<ApiResponse<{
    interviewType: 'deep';
    modules: ModuleMetadata[];
    totalQuestions: number;
    estimatedMinutes: number;
  }>> {
    const response = await this.api.get('/api/interviews/questions/deep/modules');
    return response.data;
  }

  async getDeepModule(moduleId: string): Promise<ApiResponse<QuestionSet>> {
    const response = await this.api.get(`/api/interviews/questions/deep/${moduleId}`);
    return response.data;
  }

  // Interview management endpoints (protected)
  async startInterview(data: StartInterviewRequest): Promise<ApiResponse<Interview>> {
    const response = await this.api.post('/api/interviews/start', data);
    return response.data;
  }

  async getMyInterviews(): Promise<ApiResponse<Interview[]>> {
    const response = await this.api.get('/api/interviews/my-interviews');
    return response.data;
  }

  async getInterviewStatus(interviewId: string): Promise<ApiResponse<InterviewStatus>> {
    const response = await this.api.get(`/api/interviews/${interviewId}`);
    return response.data;
  }

  async saveAnswer(
    interviewId: string,
    data: SaveAnswerRequest
  ): Promise<ApiResponse<Interview>> {
    const response = await this.api.put(`/api/interviews/${interviewId}/answer`, data);
    return response.data;
  }

  async updatePosition(
    interviewId: string,
    currentModule: string,
    currentQuestion: number
  ): Promise<ApiResponse<Interview>> {
    const response = await this.api.put(`/api/interviews/${interviewId}/position`, {
      currentModule,
      currentQuestion,
    });
    return response.data;
  }

  async completeModule(
    interviewId: string,
    moduleId: string
  ): Promise<ApiResponse<Interview>> {
    const response = await this.api.post(`/api/interviews/${interviewId}/complete-module`, {
      moduleId,
    });
    return response.data;
  }

  async completeInterview(interviewId: string): Promise<ApiResponse<Interview>> {
    const response = await this.api.post(`/api/interviews/${interviewId}/complete`);
    return response.data;
  }

  async upgradeInterview(interviewId: string): Promise<ApiResponse<Interview>> {
    const response = await this.api.post(`/api/interviews/${interviewId}/upgrade`);
    return response.data;
  }

  async abandonInterview(interviewId: string): Promise<ApiResponse<Interview>> {
    const response = await this.api.delete(`/api/interviews/${interviewId}/abandon`);
    return response.data;
  }

  async getDeepModules(interviewId: string): Promise<ApiResponse<any[]>> {
    const response = await this.api.get(`/api/interviews/${interviewId}/modules`);
    return response.data;
  }

  async getResults(interviewId: string): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/api/results/${interviewId}`);
    return response.data;
  }

  async downloadResultsPDF(interviewId: string): Promise<void> {
    const response = await this.api.get(`/api/results/${interviewId}/pdf`, {
      responseType: 'blob',
    });

    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `career-fit-report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const api = new ApiService();
