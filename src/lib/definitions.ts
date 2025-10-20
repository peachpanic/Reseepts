export interface User {
  user_id: number;
  full_name: string;
  email: string;
  password_hash: string;
  school_id: string;
  allowance: number;
  savings_goal: number;
  created_at: string;
}

export interface Transaction {
  expense_id: number;
  user_id: number;
  category_id: number;
  amount: number;
  description: string;
  payment_method: string;
  expense_date: Date;
  created_at: Date;
  Transaction_items?: TransactionItem[];
}

export interface TransactionItem {
  id: number;
  expense_id: number;
  item_name: string;
  created_at: Date;
  subcategory: string;
  amount: number;
}

export interface Category {
  category_id: number;
  category_name: string;
  icon: string;
  user_id: number;
}

export interface Goal {
  goal_id: number;
  user_id: number;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ImageFile {
  name: string;
  size: number;
  type: string;
}

export interface UploadResult {
  success: boolean;
  filename?: string;
  error?: string;
  message?: string;
}

interface ExpenseData {
  expense_id: number;
  user_id: number;
  category_id: number | null;
  amount: number;
  description: string | null;
  payment_method: string;
  source: string;
  emotion_tag: string | null;
  expense_date: string;
  created_at: string;
}

export interface UserData {
  full_name: string;
  allowance: number;
  savings_goal: number | null;
}
