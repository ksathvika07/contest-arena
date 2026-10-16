const BASE_URL = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('contest_arena_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('contest_arena_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('contest_arena_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: any) =>
    request<{ success: boolean; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request<{ success: boolean; user: any }>('/auth/me'),

  updateProfile: (updates: { name?: string; department?: string; avatarId?: string }) =>
    request<{ success: boolean; user: any }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  getAvatars: () => request<{ success: boolean; avatars: any[] }>('/auth/avatars'),

  // Contests
  getContests: (params: { status?: string; type?: string; search?: string; page?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.append('status', params.status);
    if (params.type) q.append('type', params.type);
    if (params.search) q.append('search', params.search);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit));
    return request<{ success: boolean; contests: any[]; pagination: any }>(`/contests?${q.toString()}`);
  },

  getContest: (contestId: string) =>
    request<{ success: boolean; contest: any }>(`/contests/${contestId}`),

  createContest: (contestData: any) =>
    request<{ success: boolean; contest: any }>('/contests', {
      method: 'POST',
      body: JSON.stringify(contestData),
    }),

  updateContest: (contestId: string, updates: any) =>
    request<{ success: boolean; contest: any }>(`/contests/${contestId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteContest: (contestId: string) =>
    request<{ success: boolean; message: string }>(`/contests/${contestId}`, {
      method: 'DELETE',
    }),

  updateContestStatus: (contestId: string, status: string) =>
    request<{ success: boolean; contest: any }>(`/contests/${contestId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  registerForContest: (contestId: string) =>
    request<{ success: boolean; message: string; registration: any }>(`/contests/${contestId}/register`, {
      method: 'POST',
    }),

  getParticipants: (contestId: string) =>
    request<{ success: boolean; participants: any[] }>(`/contests/${contestId}/participants`),

  toggleBookmark: (contestId: string) =>
    request<{ success: boolean; isBookmarked: boolean }>(`/contests/${contestId}/bookmark`, {
      method: 'POST',
    }),

  // Leaderboard
  getLeaderboard: (contestId: string, params: { page?: number; limit?: number; department?: string; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit));
    if (params.department) q.append('department', params.department);
    if (params.search) q.append('search', params.search);
    return request<any>(`/contests/${contestId}/leaderboard?${q.toString()}`);
  },

  getMyRank: (contestId: string) =>
    request<any>(`/contests/${contestId}/leaderboard/me`),

  getParticipantRank: (contestId: string, studentId: string) =>
    request<any>(`/contests/${contestId}/participants/${studentId}/rank`),

  rebuildLeaderboard: (contestId: string) =>
    request<{ success: boolean; restoredEntriesCount: number }>(`/contests/${contestId}/leaderboard/rebuild`, {
      method: 'POST',
    }),

  // Problems & Code Submission
  getProblems: (contestId: string) =>
    request<{ success: boolean; problems: any[] }>(`/contests/${contestId}/problems`),

  getProblem: (contestId: string, problemId: string) =>
    request<{ success: boolean; problem: any }>(`/contests/${contestId}/problems/${problemId}`),

  submitSolution: (contestId: string, problemId: string, data: { language: string; code: string }) =>
    request<any>(`/contests/${contestId}/problems/${problemId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Submissions
  submitScore: (contestId: string, submissionData: any) =>
    request<any>(`/contests/${contestId}/submissions`, {
      method: 'POST',
      body: JSON.stringify(submissionData),
    }),

  getContestSubmissions: (contestId: string) =>
    request<{ success: boolean; submissions: any[] }>(`/contests/${contestId}/submissions`),

  getMySubmissions: () =>
    request<{ success: boolean; submissions: any[] }>('/users/me/submissions'),

  // Analytics
  getOverviewAnalytics: () =>
    request<{ success: boolean; data: any }>('/analytics/overview'),

  getContestAnalytics: (contestId: string) =>
    request<any>(`/analytics/contests/${contestId}`),

  getMyAnalytics: () =>
    request<any>('/analytics/users/me'),

  // Admin & Demo
  getHealth: () => request<any>('/admin/health'),

  getDatabaseDemo: () => request<any>('/admin/database-demo'),

  simulateScore: (contestId?: string) =>
    request<any>('/admin/simulate/score', {
      method: 'POST',
      body: JSON.stringify({ contestId }),
    }),

  startSimulation: (contestId?: string, intervalSeconds: number = 3) =>
    request<any>('/admin/simulate/start', {
      method: 'POST',
      body: JSON.stringify({ contestId, intervalSeconds }),
    }),

  stopSimulation: () =>
    request<any>('/admin/simulate/stop', { method: 'POST' }),

  getSimulationStatus: () =>
    request<any>('/admin/simulate/status'),

  // Notifications
  getNotifications: () =>
    request<{ success: boolean; notifications: any[]; unreadCount: number }>('/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', { method: 'PATCH' }),
};
