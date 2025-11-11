/*
  # Create Students and Exam Responses Tables

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `name` (text) - اسم الطالب
      - `phone` (text) - رقم الهاتف
      - `email` (text) - البريد الإلكتروني
      - `created_at` (timestamptz)
    
    - `exam_responses`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `question_number` (integer)
      - `answer` (text) - A, B, C, or D
      - `learning_style` (text) - V, A, R, or K
      - `created_at` (timestamptz)
    
  2. Security
    - Enable RLS on both tables
    - Add policies for public insert access (since this is an exam form)
    - Add policies for authenticated users to read data
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exam_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  question_number integer NOT NULL,
  answer text NOT NULL,
  learning_style text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert students"
  ON students
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can insert exam responses"
  ON exam_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read students"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read exam responses"
  ON exam_responses
  FOR SELECT
  TO authenticated
  USING (true);