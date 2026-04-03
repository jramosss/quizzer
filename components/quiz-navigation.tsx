interface QuizNavigationProps {
  onPrevious: () => void
  onNext: () => void
  onSkip: () => void
  canPrevious: boolean
  canNext: boolean
  hasSelected: boolean
  onSubmit: () => void
  feedbackShown: boolean
}

export default function QuizNavigation({
  onPrevious,
  onNext,
  onSkip,
  canPrevious,
  canNext,
  onSubmit,
  feedbackShown,
}: QuizNavigationProps) {
  return (
    <div className="flex gap-3 flex-wrap justify-between items-center">
      <div className="flex gap-2">
        <button
          onClick={onPrevious}
          disabled={!canPrevious}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            canPrevious
              ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
          }`}
        >
          ← Anterior
        </button>

        {!feedbackShown && (
          <button
            onClick={onSkip}
            disabled={!canNext}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              canNext
                ? 'bg-muted hover:bg-muted/80 text-muted-foreground'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            }`}
          >
            Saltear →
          </button>
        )}
      </div>

      {feedbackShown && (
        <button
          onClick={onNext}
          disabled={!canNext}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            canNext
              ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
          }`}
        >
          Próxima →
        </button>
      )}
    </div>
  )
}
