'use client'

interface Answer {
  text: string
  correcta: boolean
}

interface Question {
  pregunta: string
  respuestas: Answer[]
  topic: string
}

interface UserResponse {
  questionIndex: number
  selectedAnswers: number[]
  isCorrect: boolean
}

interface QuizSummaryProps {
  responses: UserResponse[]
  quizzes: Question[]
  onRestart: () => void
}

export default function QuizSummary({
  responses,
  quizzes,
  onRestart,
}: QuizSummaryProps) {
  const correctCount = responses.filter((r) => r.isCorrect).length
  const percentage = Math.round((correctCount / quizzes.length) * 100)

  const getResultMessage = () => {
    if (percentage === 100) return '¡Perfecto! ¡Excelente trabajo!'
    if (percentage >= 80) return '¡Muy bien! Has demostrado buen conocimiento'
    if (percentage >= 60) return 'Buen desempeño. Sigue practicando'
    return 'Necesitas repasar. ¡Inténtalo de nuevo!'
  }

  const getResultColor = () => {
    if (percentage === 100) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Cuestionario Completado
            </h1>
            <p className={`text-5xl font-bold ${getResultColor()}`}>
              {percentage}%
            </p>
            <p className="text-xl text-muted-foreground">
              {getResultMessage()}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Respuestas correctas</span>
              <span className="font-bold text-foreground">
                {correctCount}/{quizzes.length}
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            <h2 className="font-semibold text-foreground">Detalle de respuestas</h2>
            {responses.map((response, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  response.isCorrect
                    ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
                    : 'border-red-200 bg-red-50 dark:bg-red-950/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                      response.isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {response.isCorrect ? '✓' : '✗'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">
                      {quizzes[response.questionIndex].pregunta}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        response.isCorrect
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-red-700 dark:text-red-400'
                      }`}
                    >
                      {response.isCorrect ? 'Correcto' : 'Incorrecto'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onRestart}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Reintentar Cuestionario
          </button>
        </div>
      </div>
    </div>
  )
}
