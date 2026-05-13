'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Timer, CheckCircle, XCircle, Loader2, ArrowRight, Trophy } from 'lucide-react';
import { useQuizQuestions, useSubmitQuizAnswer, useCompleteQuiz } from '@/hooks/queries/useQuiz';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';

export default function QuizLevelPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const level = parseInt(params.level as string);
  const quizId = searchParams.get('quiz_id') || '';
  const { theme } = useUIStore();
  const isDark = theme === "dark";

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState<{ score: number; points_earned: number } | null>(null);

  const { data: questions, isLoading } = useQuizQuestions(level);
  const submitAnswerMutation = useSubmitQuizAnswer();
  const completeQuizMutation = useCompleteQuiz();

  const currentQuestion = questions?.[currentQuestionIndex];
  const totalQuestions = questions?.length || 0;
  const correctAnswers = Array.from(answers.values()).filter((ans, idx) => {
    const q = questions?.[idx];
    return q && ans === q.correct_answer;
  }).length;

  const handleSelectAnswer = (answerIndex: number) => {
    if (showExplanation || isSubmitting) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !currentQuestion || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await submitAnswerMutation.mutateAsync({
        quiz_id: quizId,
        question_id: currentQuestion.id,
        answer: selectedAnswer,
      });

      setAnswers((prev) => new Map(prev).set(currentQuestion.id, selectedAnswer));
      setShowExplanation(true);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Complete quiz
      handleCompleteQuiz();
    }
  };

  const handleCompleteQuiz = async () => {
    try {
      const result = await completeQuizMutation.mutateAsync(quizId);
      setResult(result);
      setQuizCompleted(true);
    } catch (error) {
      console.error('Failed to complete quiz:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
        <Loader2 className={`size-10 animate-spin ${isDark ? "text-green" : "text-[#0a7c6e]"}`} />
      </div>
    );
  }

  if (quizCompleted && result) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
        <div className={`rounded-xl shadow-lg p-8 max-w-md w-full text-center ${isDark ? "bg-[#1c211e]" : "bg-white"}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? "bg-[#0D645F]" : "bg-[#0a7c6e]"}`}>
            <Trophy className="size-10 text-white" />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>Quiz Selesai!</h1>
          <p className={`mb-6 ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>Level {level}</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className={`rounded-lg p-4 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
              <p className={`text-3xl font-bold ${isDark ? "text-green" : "text-[#0a7c6e]"}`}>{correctAnswers}</p>
              <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>Jawaban Benar</p>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
              <p className={`text-3xl font-bold ${isDark ? "text-red-400" : "text-red-500"}`}>{totalQuestions - correctAnswers}</p>
              <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>Jawaban Salah</p>
            </div>
          </div>

          <div className={`rounded-lg p-4 mb-8 ${isDark ? "bg-[#0D645F]" : "bg-[#0a7c6e]"}`}>
            <p className="text-white text-lg font-bold">+{result.points_earned} Points</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/quiz')}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${isDark ? "bg-[#0D645F] hover:bg-[#0a514d] text-white" : "bg-[#0a7c6e] hover:bg-[#095a50] text-white"}`}
            >
              Kembali ke Quiz
            </button>
            <button
              onClick={() => router.push('/leaderboard')}
              className={`w-full py-3 rounded-lg font-medium border-2 transition-colors ${isDark ? "border-green text-green hover:bg-green hover:text-black" : "border-[#0a7c6e] text-[#0a7c6e] hover:bg-[#0a7c6e] hover:text-white"}`}
            >
              Lihat Leaderboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion || !currentQuestion.options) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
        <div className="text-center">
          <p className={`mb-4 ${isDark ? "text-white/60" : "text-gray-500"}`}>Pertanyaan tidak ditemukan atau data tidak valid</p>
          <button onClick={() => router.push('/quiz')} className={`px-6 py-3 rounded-lg font-medium ${isDark ? "bg-[#0D645F] text-white" : "bg-[#0a7c6e] text-white"}`}>
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
      {/* Header */}
      <div className={`py-4 ${isDark ? "bg-[#0D645F] text-white" : "bg-[#0a7c6e] text-white"}`}>
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Level {level}</h1>
            <div className="flex items-center gap-2">
              <span>{currentQuestionIndex + 1} / {totalQuestions}</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mt-3">
            <div
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="container-custom py-8">
        <div className={`rounded-xl shadow-lg p-6 md:p-8 ${isDark ? "bg-[#1c211e]" : "bg-white"}`}>
          {/* Question Image if exists */}
          {currentQuestion.image_url && (
            <div className="w-full h-[200px] md:h-[300px] mb-6 rounded-lg overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${currentQuestion.image_url}`}
                alt="Question"
                className="w-full h-full object-contain bg-gray-100"
              />
            </div>
          )}

          {/* Question Text */}
          <h2 className={`text-xl md:text-2xl font-bold mb-8 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
            {currentQuestion.question}
          </h2>

          {/* Answer Options */}
          <div className="space-y-4">
            {(currentQuestion.options || []).map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correct_answer;
              const showCorrect = showExplanation && isCorrect;
              const showWrong = showExplanation && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={showExplanation}
                  className={cn(
                    'w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3',
                    isSelected && !showExplanation && `${isDark ? "border-green bg-green/5" : "border-[#0a7c6e] bg-[#0a7c6e]/5"}`,
                    showCorrect && 'border-green-500 bg-green-50',
                    showWrong && 'border-red-500 bg-red-50',
                    !showExplanation && !isSelected && `${isDark ? "border-white/10 hover:border-green/50" : "border-gray-200 hover:border-[#0a7c6e]/50"}`
                  )}
                >
                  <span
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
                      isSelected && !showExplanation && (isDark ? 'bg-green text-black' : 'bg-[#0a7c6e] text-white'),
                      showCorrect && 'bg-green-500 text-white',
                      showWrong && 'bg-red-500 text-white',
                      !isSelected && !showCorrect && !showWrong && (isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600')
                    )}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className={`font-medium ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>{option}</span>
                  {showCorrect && <CheckCircle className="size-5 text-green-500 ml-auto" />}
                  {showWrong && <XCircle className="size-5 text-red-500 ml-auto" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && currentQuestion.explanation && (
            <div className={`mt-6 p-4 rounded-lg ${isDark ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-yellow-50 border border-yellow-200"}`}>
              <p className={`text-sm ${isDark ? "text-yellow-300" : "text-yellow-800"}`}>
                <strong>Penjelasan:</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end">
            {!showExplanation ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || isSubmitting}
                className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 ${isDark ? "bg-[#0D645F] hover:bg-[#0a514d] text-white" : "bg-[#0a7c6e] hover:bg-[#095a50] text-white"}`}
              >
                {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : 'Jawab'}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${isDark ? "bg-[#0D645F] hover:bg-[#0a514d] text-white" : "bg-[#0a7c6e] hover:bg-[#095a50] text-white"}`}
              >
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <>
                    Selanjutnya <ArrowRight className="size-5" />
                  </>
                ) : (
                  <>
                    Selesai <Trophy className="size-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
