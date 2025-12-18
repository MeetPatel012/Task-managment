import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on auth pages
      const isAuthPage =
        typeof window !== "undefined" &&
        (window.location.pathname === "/login" ||
          window.location.pathname === "/register");

      if (!isAuthPage) {
        // Clear token and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Auth
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      apiClient.post("/auth/register", data),
    login: (data: { email: string; password: string }) =>
      apiClient.post("/auth/login", data),
    getMe: () => apiClient.get("/auth/me"),
    updateProfile: (data: { name?: string; email?: string }) =>
      apiClient.patch("/auth/profile", data),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      apiClient.patch("/auth/password", data),
  },

  // Projects
  projects: {
    getAll: (params?: {
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    }) => apiClient.get("/projects", { params }),
    getById: (id: string) => apiClient.get(`/projects/${id}`),
    create: (data: any) => apiClient.post("/projects", data),
    update: (id: string, data: any) => apiClient.patch(`/projects/${id}`, data),
    delete: (id: string) => apiClient.delete(`/projects/${id}`),
    addMember: (
      id: string,
      data: { userId?: string; email?: string; role: string }
    ) => apiClient.post(`/projects/${id}/members`, data),
    removeMember: (id: string, userId: string) =>
      apiClient.delete(`/projects/${id}/members/${userId}`),
  },

  // Tasks
  tasks: {
    getByProject: (
      projectId: string,
      params?: { status?: string; assignee?: string; search?: string }
    ) => apiClient.get(`/tasks/projects/${projectId}/tasks`, { params }),
    getById: (id: string) => apiClient.get(`/tasks/${id}`),
    create: (projectId: string, data: any) =>
      apiClient.post(`/tasks/projects/${projectId}/tasks`, data),
    update: (id: string, data: any) => apiClient.patch(`/tasks/${id}`, data),
    reorder: (id: string, data: { status: string; order: number }) =>
      apiClient.patch(`/tasks/${id}/reorder`, data),
    delete: (id: string) => apiClient.delete(`/tasks/${id}`),
  },

  // Comments
  comments: {
    getByTask: (taskId: string) =>
      apiClient.get(`/comments/tasks/${taskId}/comments`),
    create: (
      taskId: string,
      data: { content: string; parentComment?: string }
    ) => apiClient.post(`/comments/tasks/${taskId}/comments`, data),
    delete: (id: string) => apiClient.delete(`/comments/${id}`),
  },

  // Dashboard
  dashboard: {
    getOverview: () => apiClient.get("/dashboard/overview"),
  },
};
