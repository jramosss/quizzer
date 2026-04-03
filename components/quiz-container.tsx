'use client'

import { useState, useEffect } from 'react'
import QuestionCard from './question-card'
import QuizNavigation from './quiz-navigation'
import ProgressBar from './progress-bar'
import QuizSummary from './quiz-summary'

interface Answer {
  text: string
  correcta: boolean
}

interface Question {
  pregunta: string
  respuestas: Answer[]
  topic?: string
}

interface UserResponse {
  questionIndex: number
  selectedAnswers: number[]
  isCorrect: boolean
}

interface QuizContainerProps {
  quizzes: Question[]
  onExit?: () => void
}

export default function QuizContainer({ quizzes, onExit }: QuizContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<UserResponse[]>([])
  const [completed, setCompleted] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [feedbackShown, setFeedbackShown] = useState(false)
  const [currentFeedbackCorrect, setCurrentFeedbackCorrect] = useState(false)

  useEffect(() => {
    setSelectedAnswers([])
    setFeedbackShown(false)
  }, [currentIndex])

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers((prev) => {
      if (prev.includes(answerIndex)) {
        return prev.filter((i) => i !== answerIndex)
      }
      return [...prev, answerIndex]
    })
  }

  const handleSubmitAnswer = () => {
    if (!feedbackShown) {
      const currentQuestion = quizzes[currentIndex]
      const correctAnswerIndices = currentQuestion.respuestas
        .map((ans, idx) => (ans.correcta ? idx : -1))
        .filter((idx) => idx !== -1)

      const isCorrect =
        selectedAnswers.length === correctAnswerIndices.length &&
        selectedAnswers.every((idx) => correctAnswerIndices.includes(idx))

      setCurrentFeedbackCorrect(isCorrect)
      setFeedbackShown(true)
      return
    }

    const currentQuestion = quizzes[currentIndex]
    const correctAnswerIndices = currentQuestion.respuestas
      .map((ans, idx) => (ans.correcta ? idx : -1))
      .filter((idx) => idx !== -1)

    const isCorrect =
      selectedAnswers.length === correctAnswerIndices.length &&
      selectedAnswers.every((idx) => correctAnswerIndices.includes(idx))

    setResponses([
      ...responses,
      {
        questionIndex: currentIndex,
        selectedAnswers,
        isCorrect,
      },
    ])

    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCompleted(true)
    }
  }

  const handleNext = () => {
    if (!feedbackShown && selectedAnswers.length > 0) {
      const currentQuestion = quizzes[currentIndex]
      const correctAnswerIndices = currentQuestion.respuestas
        .map((ans, idx) => (ans.correcta ? idx : -1))
        .filter((idx) => idx !== -1)

      const isCorrect =
        selectedAnswers.length === correctAnswerIndices.length &&
        selectedAnswers.every((idx) => correctAnswerIndices.includes(idx))

      setResponses([
        ...responses,
        {
          questionIndex: currentIndex,
          selectedAnswers,
          isCorrect,
        },
      ])
    } else if (feedbackShown) {
      // If feedback was shown, response already recorded
    }

    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSkip = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setResponses([])
    setCompleted(false)
    setSelectedAnswers([])
    setFeedbackShown(false)
  }

  if (completed) {
    return (
      <QuizSummary
        responses={responses}
        quizzes={quizzes}
        onRestart={handleRestart}
        onExit={onExit}
      />
    )
  }

  const currentQuestion = quizzes[currentIndex]
  const hasMultipleCorrect = currentQuestion.respuestas.filter(
    (ans) => ans.correcta
  ).length > 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onExit && (
                <button
                  onClick={onExit}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Salir del cuestionario"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
              )}
              <h1 className="text-3xl font-bold text-foreground">QuizPro</h1>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Pregunta {currentIndex + 1} de {quizzes.length}
            </span>
          </div>
          <ProgressBar current={currentIndex + 1} total={quizzes.length} />
        </div>

        {/* Question Card */}
        <QuestionCard
          question={currentQuestion}
          selectedAnswers={selectedAnswers}
          onAnswerSelect={handleAnswerSelect}
          hasMultipleCorrect={hasMultipleCorrect}
          onSubmit={handleSubmitAnswer}
          feedbackShown={feedbackShown}
          isCorrect={currentFeedbackCorrect}
        />

        {/* Navigation */}
        <QuizNavigation
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSkip={handleSkip}
          canPrevious={currentIndex > 0}
          canNext={currentIndex < quizzes.length - 1}
          hasSelected={selectedAnswers.length > 0}
          onSubmit={handleSubmitAnswer}
          feedbackShown={feedbackShown}
        />
      </div>
    </div>
  )
}
