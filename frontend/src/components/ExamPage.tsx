import { useState } from 'react';
import { questions, answerKey } from '../data/questions';
import { CheckCircle } from 'lucide-react';
import { Student, ExamScores } from '../types';
import { buildExamRecordPayload, saveExamRecord } from '../lib/googleSheets';

const learningStyleLabels: Record<keyof ExamScores, string> = {
  V: 'بصري',
  A: 'سمعي',
  R: 'قرائي',
  K: 'حركي'
};

const summarizeDominantStyles = (scores: ExamScores) => {
  // 1. ترتيب الدرجات تنازلياً لمعرفة الأعلى
  const sortedScores = (Object.entries(scores) as [keyof ExamScores, number][])
    .sort(([, a], [, b]) => b - a);

  const [first, second] = sortedScores;

  // 2. تطبيق قاعدة الفارق: إذا كان الفرق بين الأول والثاني 2 أو أكثر، فهو نمط أحادي
  if (first[1] - second[1] >= 2) {
    return learningStyleLabels[first[0]];
  }

  // 3. إذا لم يتحقق شرط الفارق (أقل من 2)، يظهر كمتعدد الحواس (بصري/حركي) حسب قواعد الملف
  return 'متعدد الحواس (بصري/حركي)';
};

interface ExamPageProps {
  student: Student;
}

export function ExamPage({ student }: ExamPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string[] }>({});
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<ExamScores | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  const toggleAnswer = (answer: string) => {
    const questionKey = currentQuestion + 1;
    const currentAnswers = answers[questionKey] ?? [];
    const exists = currentAnswers.includes(answer);
    const updatedAnswers = exists
      ? currentAnswers.filter((value) => value !== answer)
      : [...currentAnswers, answer];

    setAnswers({
      ...answers,
      [questionKey]: updatedAnswers
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = () => {
    const scores: ExamScores = { V: 0, A: 0, R: 0, K: 0 };

    Object.entries(answers).forEach(([questionNum, selectedAnswers]) => {
      selectedAnswers.forEach((answer) => {
        const learningStyle = answerKey[parseInt(questionNum)][answer];
        scores[learningStyle as keyof ExamScores]++;
      });
    });

    return scores;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSaveStatus('saving');
    setSaveError('');

    const scores = calculateResults();
    const dominantStyle = summarizeDominantStyles(scores);

    setResults(scores);
    setCompleted(true);

    const payload = buildExamRecordPayload(student, scores, dominantStyle);
    await saveExamRecord(payload);
    setSaveStatus('success');
    setLoading(false);
  };

  const getMaxLearningStyle = () => {
    if (!completed || !results) return '';
    return summarizeDominantStyles(results);
  };

  if (completed && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
          {saveStatus === 'saving' && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
              جارٍ حفظ نتائجك...
            </div>
          )}
          {saveStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              تم حفظ نتائجك بنجاح.
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              تعذر حفظ النتائج .
              {saveError && <span className="block text-xs text-red-500 mt-2">التفاصيل: {saveError}</span>}
            </div>
          )}
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              تم إكمال الاختبار بنجاح
            </h1>
            <p className="text-gray-600">
              شكراً لك يا {student.name} على إكمال اختبار VARK
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              نتائجك
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{results.V}</div>
                <div className="text-sm text-gray-600">بصري (V)</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{results.A}</div>
                <div className="text-sm text-gray-600">سمعي (A)</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">{results.R}</div>
                <div className="text-sm text-gray-600">قرائي (R)</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-600">{results.K}</div>
                <div className="text-sm text-gray-600">حركي (K)</div>
              </div>
            </div>
            <div className="bg-green-100 border-r-4 border-green-500 p-4 rounded">
              <p className="text-gray-700">
                <span className="font-bold">نمط التعلم المناسب لك:</span> {getMaxLearningStyle()}
              </p>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              {saveStatus === 'success'
                ? 'تم حفظ نسخة من النتائج الخاصة بك.'
                : 'تم حساب نتائجك محلياً. إذا لم يتم حفظ البيانات، يمكنك المحاولة مرة أخرى لاحقاً.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const answeredQuestions = questions.filter((_, index) => (answers[index + 1]?.length ?? 0) > 0).length;
  const progress = (answeredQuestions / questions.length) * 100;
  const currentSelections = answers[currentQuestion + 1] ?? [];
  const isAnswered = currentSelections.length > 0;
  const allAnswered = answeredQuestions === questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                السؤال {currentQuestion + 1} من {questions.length}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(progress)}% مكتمل
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 leading-relaxed">
              {question.text}
            </h2>

            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = currentSelections.includes(option.value);
                return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleAnswer(option.value)}
                  className={`w-full text-right p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 ml-3 flex items-center justify-center ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-500'
                    }`}>
                      {isSelected ? '✓' : ''}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{option.text}</span>
                  </div>
                </button>
              );
              })}
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              السابق
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || loading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'جاري الإرسال...' : 'إنهاء الاختبار'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                التالي
              </button>
            )}
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              {allAnswered
                ? 'لقد أجبت على جميع الأسئلة. يمكنك المراجعة أو إنهاء الاختبار.'
                : `تبقى ${questions.length - Object.keys(answers).length} سؤال`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}