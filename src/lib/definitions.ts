export interface Expense {
  expense_id: number;
  user_id: number;
  category_id: number;
  amount: number;
  description: string;
  payment_method: string;
  source: string;
  emotion_tag: string;
  expense_date: Date;
  created_at: Date;
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
