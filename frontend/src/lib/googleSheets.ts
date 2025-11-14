import { ExamScores, Student } from '../types';

const sheetsEndpoint = import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL;

export interface ExamRecordPayload {
  name: string;
  phone: string;
  email: string;
  visual: number;
  auditory: number;
  readWrite: number;
  kinesthetic: number;
  dominantStyle: string;
  submittedAt: string;
}

export const buildExamRecordPayload = (
  student: Student,
  scores: ExamScores,
  dominantStyle: string
): ExamRecordPayload => ({
  name: student.name,
  phone: student.phone,
  email: student.email,
  visual: scores.V,
  auditory: scores.A,
  readWrite: scores.R,
  kinesthetic: scores.K,
  dominantStyle,
  submittedAt: new Date().toISOString()
});

export const saveExamRecord = async (payload: ExamRecordPayload) => {
  if (!sheetsEndpoint) {
    // We can still keep this check
    throw new Error('لم يتم ضبط عنوان Google Sheets. يرجى إضافة VITE_GOOGLE_SHEETS_WEB_APP_URL.');
  }

  // Fire and forget: We send the request but don't await the response
  // or check its 'ok' status.
  fetch(sheetsEndpoint, {
    method: 'POST',
    body: JSON.stringify(payload),
    mode: 'no-cors'
  });
};