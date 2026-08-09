import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://placement-portal-sqlite-backend-31gm.onrender.com/api',
  timeout: 8000
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('pp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('pp_token');
      localStorage.removeItem('pp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

export const courseAPI = {
  getAll: (params) => API.get('/courses', { params }),
  getById: (id) => API.get(`/courses/${id}`),
  create: (data) => API.post('/courses', data),
  enroll: (id) => API.post(`/courses/${id}/enroll`),
  updateProgress: (id, progress) => API.put(`/courses/${id}/progress`, { progress }),
};

export const quizAPI = {
  getAll: (params) => API.get('/quizzes', { params }),
  getById: (id) => API.get(`/quizzes/${id}`),
  submit: (id, data) => API.post(`/quizzes/${id}/submit`, data),
  runCode: (data) => API.post('/quizzes/code/run', data),
  create: (data) => API.post('/quizzes', data),
  getMyResults: () => API.get('/quizzes/results/me'),
};

export const analyticsAPI = {
  getLeaderboard: (params) => API.get('/analytics/leaderboard', { params }),
  getMyAnalytics: () => API.get('/analytics/me'),
  getStudentAnalytics: (id) => API.get(`/analytics/student/${id}`),
  getFacultyAnalytics: () => API.get('/analytics/faculty'),
  getAdminAnalytics: () => API.get('/analytics/admin'),
  getMyBadges: () => API.get('/analytics/badges/me'),
  getNotifications: () => API.get('/analytics/notifications'),
  markRead: (id) => API.patch(`/analytics/notifications/${id}/read`),
};

export default API;
