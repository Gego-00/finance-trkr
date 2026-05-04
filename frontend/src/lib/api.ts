import axios from 'axios';
import type { AuthResponse, Category, CategoryInput, Transaction, TransactionInput, Analytics, SavingsGoal, SavingsProgress } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

if (!API_URL) {
  console.error('❌ VITE_API_URL no está definida');
  throw new Error('VITE_API_URL is required');
}

if (import.meta.env.DEV) {
  console.log('🌐 API URL:', API_URL);
  console.log('📍 Mode:', import.meta.env.MODE);
}

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  register: (email: string, password: string, fullName: string) =>
    api.post<AuthResponse>('/auth/register', { email, password, fullName }),
};

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories'),
  create: (data: CategoryInput) => api.post<Category>('/categories', data),
  update: (id: number, data: CategoryInput) => api.put<Category>(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const transactionsApi = {
  getAll: (params?: { startDate?: string; endDate?: string; type?: string }) =>
    api.get<Transaction[]>('/transactions', { params }),
  create: (data: TransactionInput) =>
    api.post<Transaction>('/transactions', data),
  update: (id: number, data: TransactionInput) =>
    api.put<Transaction>(`/transactions/${id}`, data),
  delete: (id: number) => api.delete(`/transactions/${id}`),
  getAnalytics: (params?: { startDate?: string; endDate?: string }) =>
    api.get<Analytics>('/transactions/analytics', { params }),
};

export const savingsGoalsApi = {
  getGoal: () => api.get<SavingsGoal | null>('/savings-goals'),
  upsertGoal: (targetPercentage: number) =>
    api.put<SavingsGoal>('/savings-goals', { targetPercentage }),
  getProgress: (months?: number) =>
    api.get<SavingsProgress[]>('/savings-goals/progress', { params: { months } }),
};

export default api;
