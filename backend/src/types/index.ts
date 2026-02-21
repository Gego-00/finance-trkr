export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  created_at: Date;
}

export interface Transaction {
  id: number;
  user_id: number;
  category_id: number | null;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  date: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Express.Request {
  user?: {
    id: number;
    email: string;
  };
}
