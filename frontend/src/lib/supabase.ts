import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Student {
  id?: string;
  name: string;
  phone: string;
  email: string;
  created_at?: string;
}

export interface ExamResponse {
  id?: string;
  student_id: string;
  question_number: number;
  answer: string;
  learning_style: string;
  created_at?: string;
}
