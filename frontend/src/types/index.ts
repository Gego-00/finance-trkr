export interface User {
  id: number;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  category_id: number | null;
  type: 'income' | 'expense';
  amount: string;
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_color?: string;
}

export interface TransactionInput {
  categoryId?: number;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  date: string;
}

export interface CategoryInput {
  name: string;
  type: 'income' | 'expense';
  color?: string;
}

export interface SavingsGoal {
  id: number;
  user_id: number;
  target_percentage: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsProgress {
  month: string;
  total_income: string;
  total_expenses: string;
  savings_rate: number;
}

export interface Analytics {
  summary: {
    total_income: string;
    total_expenses: string;
    total_transactions: string;
  };
  byCategory: Array<{
    name: string;
    color: string;
    type: 'income' | 'expense';
    total: string;
  }>;
  byMonth: Array<{
    month: string;
    type: 'income' | 'expense';
    total: string;
  }>;
}
