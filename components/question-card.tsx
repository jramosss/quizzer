'use client'

interface Answer {
  text: string
  correcta: boolean
}

interface QuestionCardProps {
  question: {
    pregunta: string
    respuestas: Answer[]
    topic?: string
  }
  selectedAnswers: number[]
  onAnswerSelect: (index: number) => void
  hasMultipleCorrect: boolean
  onSubmit: () => void
  feedbackShown: boolean
  isCorrect?: boolean
}

export default function QuestionCard({
  question,
  selectedAnswers,
  onAnswerSelect,
  hasMultipleCorrect,
  onSubmit,
  feedbackShown,
  isCorrect,
}: QuestionCardProps) {
  const correctAnswerIndices = question.respuestas
    .map((ans, idx) => (ans.correcta ? idx : -1))
    .filter((idx) => idx !== -1)

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-8 space-y-6">
      {/* Topic Badge */}
      {question.topic && (
        <div>
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
            {question.topic}
          </span>
        </div>
      )}

      {/* Question */}
      <div>
        <h2 className="text-2xl font-bold text-foreground leading-relaxed">
          {question.pregunta}
        </h2>
        {hasMultipleCorrect && (
          <p className="text-sm text-muted-foreground mt-3">
            ⓘ Múltiples respuestas correctas posibles
          </p>
        )}
      </div>

      {/* Answers */}
      <div className="space-y-3">
        {question.respuestas.map((answer, index) => {
          const isSelected = selectedAnswers.includes(index)
          const isCorrectAnswer = correctAnswerIndices.includes(index)
          
          let borderStyle = 'border-border bg-background hover:border-primary/50 hover:bg-primary/2'
          let checkboxStyle = 'border-border group-hover:border-primary/50'

          if (feedbackShown) {
            if (isCorrectAnswer) {
              // Show correct answers in green
              borderStyle = 'border-green-500 bg-green-50 dark:bg-green-950/20'
              checkboxStyle = 'border-green-500 bg-green-500'
            } else if (isSelected) {
              // Show incorrect selected answers in red
              borderStyle = 'border-red-500 bg-red-50 dark:bg-red-950/20'
              checkboxStyle = 'border-red-500 bg-red-500'
            } else if (!isCorrectAnswer) {
              // Show unselected wrong answers faded
              borderStyle = 'border-border bg-background opacity-60'
              checkboxStyle = 'border-border'
            }
          } else if (isSelected) {
            // Before feedback, just show selection
            borderStyle = 'border-primary bg-primary/5'
            checkboxStyle = 'bg-primary border-primary'
          }

          return (
            <button
              key={index}
              onClick={() => !feedbackShown && onAnswerSelect(index)}
              disabled={feedbackShown}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left group disabled:cursor-default ${borderStyle}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${checkboxStyle}`}
                >
                  {feedbackShown && (
                    <>
                      {isCorrectAnswer && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {isSelected && !isCorrectAnswer && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </>
                  )}
                  {!feedbackShown && isSelected && (
                    <svg
                      className="w-3 h-3 text-primary-foreground"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-foreground font-medium leading-relaxed">
                  {answer.text}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Feedback Message */}
      {feedbackShown && (
        <div
          className={`p-4 rounded-lg text-center font-semibold ${
            isCorrect
              ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
          }`}
        >
          {isCorrect ? '✓ ¡Correcto!' : '✗ Incorrecto'}
        </div>
      )}

      {/* Submit Button */}
      {!feedbackShown && selectedAnswers.length > 0 && (
        <button
          onClick={onSubmit}
          className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Enviar Respuesta
        </button>
      )}

      {/* Continue Button */}
      {feedbackShown && (
        <button
          onClick={onSubmit}
          className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Continuar
        </button>
      )}
    </div>
  )
}
