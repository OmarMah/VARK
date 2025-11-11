import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { questions, answerKey } from '../data/questions';
import { CheckCircle } from 'lucide-react';

interface ExamPageProps {
  studentId: string;
}

export function ExamPage({ studentId }: ExamPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<{ V: number; A: number; R: number; K: number } | null>(null);

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion + 1]: answer });
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
    const scores = { V: 0, A: 0, R: 0, K: 0 };

    Object.entries(answers).forEach(([questionNum, answer]) => {
      const learningStyle = answerKey[parseInt(questionNum)][answer];
      scores[learningStyle as keyof typeof scores]++;
    });

    return scores;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const examResponses = Object.entries(answers).map(([questionNum, answer]) => ({
        student_id: studentId,
        question_number: parseInt(questionNum),
        answer: answer,
        learning_style: answerKey[parseInt(questionNum)][answer]
      }));

      const { error } = await supabase
        .from('exam_responses')
        .insert(examResponses);

      if (error) throw error;

      const scores = calculateResults();
      setResults(scores);
      setCompleted(true);
    } catch (err) {
      console.error('Error submitting exam:', err);
      alert('حدث خطأ أثناء إرسال الإجابات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const getMaxLearningStyle = () => {
    if (!results) return '';
    const max = Math.max(results.V, results.A, results.R, results.K);
    const styles: string[] = [];
    if (results.V === max) styles.push('بصري');
    if (results.A === max) styles.push('سمعي');
    if (results.R === max) styles.push('قرائي');
    if (results.K === max) styles.push('حركي');
    return styles.join(' / ');
  };

  if (completed && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              تم إكمال الاختبار بنجاح
            </h1>
            <p className="text-gray-600">
              شكراً لك على إكمال اختبار VARK
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
            <p>تم حفظ نتائجك بنجاح</p>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((Object.keys(answers).length) / questions.length) * 100;
  const isAnswered = answers[currentQuestion + 1] !== undefined;
  const allAnswered = Object.keys(answers).length === questions.length;

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
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full text-right p-4 rounded-lg border-2 transition-all duration-200 ${
                    answers[currentQuestion + 1] === option.value
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 ml-3 flex items-center justify-center ${
                      answers[currentQuestion + 1] === option.value
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestion + 1] === option.value && (
                        <span className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{option.text}</span>
                  </div>
                </button>
              ))}
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
