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
  Career,
  CareerFilters,
  CareerStats,
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

  async updateProfile(data: {
    name?: string;
    headline?: string;
    location?: string;
    phoneNumber?: string;
    linkedinUrl?: string;
    about?: string;
    currentRole?: string;
    currentCompany?: string;
  }): Promise<ApiResponse<User>> {
    const response = await this.api.put('/api/auth/profile', data);
    return response.data;
  }

  async getSecurityQuestion(email: string): Promise<ApiResponse<{ securityQuestion: string }>> {
    const response = await this.api.get(`/api/auth/security-question?email=${encodeURIComponent(email)}`);
    return response.data;
  }

  async resetPassword(
    email: string,
    securityAnswer: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post('/api/auth/reset-password', {
      email,
      securityAnswer,
      newPassword,
    });
    return response.data;
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  // Generic methods for flexibility
  async get(path: string): Promise<any> {
    const response = await this.api.get(`/api${path}`);
    return response.data;
  }

  async post(path: string, data: any): Promise<any> {
    const response = await this.api.post(`/api${path}`, data);
    return response.data;
  }

  async put(path: string, data: any): Promise<any> {
    const response = await this.api.put(`/api${path}`, data);
    return response.data;
  }

  async delete(path: string): Promise<any> {
    const response = await this.api.delete(`/api${path}`);
    return response.data;
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
    try {
      console.log('🔵 Starting PDF download for interview:', interviewId);

      const response = await this.api.get(`/api/results/${interviewId}/pdf`, {
        responseType: 'blob',
      });

      console.log('🔵 PDF response received:', {
        status: response.status,
        contentType: response.headers['content-type'],
        dataSize: response.data?.size,
        dataType: typeof response.data
      });

      // Create a blob URL and open in new tab (bypasses download managers like IDM)
      const blob = new Blob([response.data], { type: 'application/pdf' });
      console.log('🔵 Blob created:', { size: blob.size, type: blob.type });

      const url = window.URL.createObjectURL(blob);
      console.log('🔵 Blob URL created:', url);

      // Open PDF in new tab instead of forcing download
      // This bypasses IDM and other download managers
      const newWindow = window.open(url, '_blank');

      if (!newWindow) {
        // Popup blocked, fallback to download
        console.log('⚠️ Popup blocked, falling back to download method');
        const link = document.createElement('a');
        link.href = url;
        link.download = `career-fit-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.log('✅ PDF opened in new tab');
        // Clean up the blob URL after a delay to ensure it loads
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      }

      console.log('✅ PDF viewing completed successfully');
    } catch (error: any) {
      console.error('❌ PDF download failed:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        fullError: error
      });
      throw error;
    }
  }

  // Career endpoints (public)
  async getAllCareers(filters?: CareerFilters): Promise<ApiResponse<{
    careers: Career[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await this.api.get(`/api/careers?${params.toString()}`);
    return response.data;
  }

  async getCareerById(id: string): Promise<ApiResponse<Career>> {
    const response = await this.api.get(`/api/careers/${id}`);
    return response.data;
  }

  async getCareerStats(): Promise<ApiResponse<CareerStats>> {
    const response = await this.api.get('/api/careers/stats');
    return response.data;
  }

  // ─────────────────────────────────────────────
  // MENTOR API METHODS
  // ─────────────────────────────────────────────

  // Mentor profile
  async signupMentor(data: any): Promise<any> {
    const response = await this.api.post('/api/mentors/signup', data);
    return response.data;
  }

  async getMyMentorProfile(): Promise<any> {
    const response = await this.api.get('/api/mentors/me');
    return response.data;
  }

  async updateMyMentorProfile(data: any): Promise<any> {
    const response = await this.api.patch('/api/mentors/me', data);
    return response.data;
  }

  async updateMentorStatus(status: string): Promise<any> {
    const response = await this.api.patch('/api/mentors/me/status', { status });
    return response.data;
  }

  async markOnboardingDone(): Promise<any> {
    const response = await this.api.patch('/api/mentors/me/onboarding-done', {});
    return response.data;
  }

  async getMenteeFeed(filters?: Record<string, string>): Promise<any> {
    const params = new URLSearchParams(filters || {});
    const response = await this.api.get(`/api/mentors/me/feed?${params}`);
    return response.data;
  }

  async getPublicMentorProfile(username: string): Promise<any> {
    const response = await this.api.get(`/api/mentors/${username}`);
    return response.data;
  }

  async checkUsernameAvailability(slug: string): Promise<any> {
    const response = await this.api.get(`/api/mentors/check-username/${slug}`);
    return response.data;
  }

  async browseMentors(params?: Record<string, string>): Promise<any> {
    const query = new URLSearchParams(params || {});
    const response = await this.api.get(`/api/mentors?${query}`);
    return response.data;
  }

  async linkedinImport(): Promise<any> {
    const response = await this.api.post('/api/mentors/linkedin-import', {});
    return response.data;
  }

  // Connections
  async createConnection(data: { mentorId: string; menteeId?: string; introMessage?: string; initiatedBy: string }): Promise<any> {
    const response = await this.api.post('/api/connections', data);
    return response.data;
  }

  async acceptConnection(id: string): Promise<any> {
    const response = await this.api.patch(`/api/connections/${id}/accept`, {});
    return response.data;
  }

  async rejectConnection(id: string, declineReason?: string): Promise<any> {
    const response = await this.api.patch(`/api/connections/${id}/reject`, { declineReason });
    return response.data;
  }

  async listConnections(): Promise<any> {
    const response = await this.api.get('/api/connections');
    return response.data;
  }

  async getConnection(id: string): Promise<any> {
    const response = await this.api.get(`/api/connections/${id}`);
    return response.data;
  }

  async endConnection(id: string): Promise<any> {
    const response = await this.api.delete(`/api/connections/${id}`);
    return response.data;
  }

  // Roadmaps
  async createRoadmap(connectionId: string, title?: string): Promise<any> {
    const response = await this.api.post('/api/roadmaps', { connectionId, title });
    return response.data;
  }

  async getRoadmap(connectionId: string): Promise<any> {
    const response = await this.api.get(`/api/roadmaps/${connectionId}`);
    return response.data;
  }

  async addMilestone(roadmapId: string, data: any): Promise<any> {
    const response = await this.api.post(`/api/roadmaps/${roadmapId}/milestones`, data);
    return response.data;
  }

  async updateMilestone(id: string, data: any): Promise<any> {
    const response = await this.api.patch(`/api/milestones/${id}`, data);
    return response.data;
  }

  async mentorConfirmMilestone(id: string): Promise<any> {
    const response = await this.api.patch(`/api/milestones/${id}/mentor-confirm`, {});
    return response.data;
  }

  async menteeConfirmMilestone(id: string): Promise<any> {
    const response = await this.api.patch(`/api/milestones/${id}/mentee-confirm`, {});
    return response.data;
  }

  async reorderMilestones(roadmapId: string, milestones: Array<{ id: string; sortOrder: number }>): Promise<any> {
    const response = await this.api.patch(`/api/roadmaps/${roadmapId}/milestones/reorder`, { milestones });
    return response.data;
  }

  async deleteMilestone(id: string): Promise<any> {
    const response = await this.api.delete(`/api/milestones/${id}`);
    return response.data;
  }

  // Sessions
  async createMentorSession(data: any): Promise<any> {
    const response = await this.api.post('/api/mentor-sessions', data);
    return response.data;
  }

  async listMentorSessions(): Promise<any> {
    const response = await this.api.get('/api/mentor-sessions');
    return response.data;
  }

  async getMentorSession(id: string): Promise<any> {
    const response = await this.api.get(`/api/mentor-sessions/${id}`);
    return response.data;
  }

  async updateMentorSession(id: string, data: any): Promise<any> {
    const response = await this.api.patch(`/api/mentor-sessions/${id}`, data);
    return response.data;
  }

  async cancelMentorSession(id: string): Promise<any> {
    const response = await this.api.delete(`/api/mentor-sessions/${id}`);
    return response.data;
  }

  async getSessionNotes(sessionId: string): Promise<any> {
    const response = await this.api.get(`/api/mentor-sessions/${sessionId}/notes`);
    return response.data;
  }

  async upsertSessionNotes(sessionId: string, content: string): Promise<any> {
    const response = await this.api.put(`/api/mentor-sessions/${sessionId}/notes`, { content });
    return response.data;
  }

  // Reviews
  async createReview(data: any): Promise<any> {
    const response = await this.api.post('/api/reviews', data);
    return response.data;
  }

  async getMentorReviews(mentorId: string): Promise<any> {
    const response = await this.api.get(`/api/reviews?mentor_id=${mentorId}`);
    return response.data;
  }

  async replyToReview(id: string, reply: string): Promise<any> {
    const response = await this.api.patch(`/api/reviews/${id}/reply`, { reply });
    return response.data;
  }

  // Notifications
  async getNotifications(page = 1): Promise<any> {
    const response = await this.api.get(`/api/notifications?page=${page}`);
    return response.data;
  }

  async markNotificationRead(id: string): Promise<any> {
    const response = await this.api.patch(`/api/notifications/${id}/read`, {});
    return response.data;
  }

  async markAllNotificationsRead(): Promise<any> {
    const response = await this.api.patch('/api/notifications/read-all', {});
    return response.data;
  }

  // Waitlist
  async joinWaitlist(mentorId: string): Promise<any> {
    const response = await this.api.post('/api/waitlist', { mentorId });
    return response.data;
  }

  async getMentorWaitlist(): Promise<any> {
    const response = await this.api.get('/api/mentors/me/waitlist');
    return response.data;
  }

  async inviteFromWaitlist(waitlistId: string): Promise<any> {
    const response = await this.api.post(`/api/waitlist/${waitlistId}/invite`, {});
    return response.data;
  }

  async leaveWaitlist(waitlistId: string): Promise<any> {
    const response = await this.api.delete(`/api/waitlist/${waitlistId}`);
    return response.data;
  }

  // Chat
  async getChatMessages(connectionId: string): Promise<any> {
    const response = await this.api.get(`/api/chat/${connectionId}`);
    return response.data;
  }

  async sendChatMessage(connectionId: string, content: string, fileUrl?: string, fileType?: string): Promise<any> {
    const response = await this.api.post(`/api/chat/${connectionId}`, { content, fileUrl, fileType });
    return response.data;
  }

  // Admin
  async adminGetPendingMentors(): Promise<any> {
    const response = await this.api.get('/api/admin/mentors/pending');
    return response.data;
  }

  async adminApproveMentor(id: string): Promise<any> {
    const response = await this.api.patch(`/api/admin/mentors/${id}/approve`, {});
    return response.data;
  }

  async adminRejectMentor(id: string, reason: string): Promise<any> {
    const response = await this.api.patch(`/api/admin/mentors/${id}/reject`, { reason });
    return response.data;
  }

  async adminVerifyCredential(id: string): Promise<any> {
    const response = await this.api.patch(`/api/admin/credentials/${id}/verify`, {});
    return response.data;
  }

  // Quick Analysis (free-text self-description → full PHẦN I-V report)
  async getQuickAnalysisUsage(): Promise<ApiResponse<{ used: number; total: number; remaining: number }>> {
    const response = await this.api.get('/api/quick-analysis/usage');
    return response.data;
  }

  async generateQuickAnalysis(
    userDescription: string,
    targetCareer: string,
    structuredData?: {
      yearsExperience?: string;
      mbtiType?: string;
      expectedSalary?: string;
      primaryBlocker?: string;
    }
  ): Promise<ApiResponse<{ analysis: string; usage: { used: number; total: number; remaining: number } }>> {
    const response = await this.api.post('/api/quick-analysis', {
      userDescription,
      targetCareer,
      structuredData,
    });
    return response.data;
  }
}

// Export singleton instance
export const api = new ApiService();
