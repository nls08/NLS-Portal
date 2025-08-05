import axios from "axios";

const API_BASE_URL = "https://nls-portal-psi.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("clerk-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Projects API
export const projectsAPI = {
  getAll: () => api.get("/projects"),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getMilestones: (id) => api.get(`/projects/${id}/milestones`),
};

// Tasks API
export const tasksAPI = {
  getAll: () => api.get("/tasks"),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post("/tasks", data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  updateTodos: (id, todos) => api.put(`/tasks/${id}/todos`, { todos }),
  moveToQA: (id) => api.put(`/tasks/${id}/qa`),
};

// Milestones API
export const milestonesAPI = {
  getAll: (type = "dev") => api.get(`/milestones?type=${type}`),
  getById: (id) => api.get(`/milestones/${id}`),
  create: (data) => api.post("/milestones", data),
  update: (id, data) => api.put(`/milestones/${id}`, data),
  delete: (id) => api.delete(`/milestones/${id}`),
};

// QA API
export const qaAPI = {
  getTasks: () => api.get("/qa/tasks"),
  updateTask: (id, data) => api.put(`/qa/tasks/${id}`, data),
  getRevisionTasks: () => api.get("/qa/revision"),
};

// Deliveries API
export const deliveriesAPI = {
  getAll: () => api.get("/deliveries"),
};

// Users API
export const usersAPI = {
  getAll: () => api.get("/users"),
  updateProfile: (data) => api.put("/users/profile", data),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
};

export default api;
