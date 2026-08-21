'use client'

import { useState, useMemo, useEffect } from 'react'
import useSWR from 'swr'
import QuizContainer from '@/components/quiz-container'
import ImportTab from '@/components/import-tab'

interface Answer {
  text: string
  correcta: boolean
}

interface Question {
  pregunta: string
  respuestas: Answer[]
  topic?: string
  imagen?: string | null
}

interface UserResponse {
  questionIndex: number
  selectedAnswers: number[]
  isCorrect: boolean
}

interface SavedProgress {
  currentIndex: number
  responses: UserResponse[]
  quizzes: Question[]
}

type Tab = 'quiz' | 'import'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('quiz')
  const [started, setStarted] = useState(false)
  const [randomizeQuestions, setRandomizeQuestions] = useState(true)
  const [randomizeAnswers, setRandomizeAnswers] = useState(true)
  const [shuffledQuizzes, setShuffledQuizzes] = useState<Question[]>([])
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(null)
  const [initialIndex, setInitialIndex] = useState(0)
  const [initialResponses, setInitialResponses] = useState<UserResponse[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('quiz_progress')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed && Array.isArray(parsed.quizzes) && typeof parsed.currentIndex === 'number') {
          setSavedProgress(parsed)
        }
      } catch (e) {
        console.error('Error loading saved quiz progress:', e)
      }
    }
  }, [])

  const { data: quizzes, isLoading, mutate } = useSWR<Question[]>('/api/quiz', fetcher)

  const topics = useMemo(() => {
    if (!quizzes) return []
    const uniqueTopics = [...new Set(quizzes.filter((q) => q.topic).map((q) => q.topic as string))]
    return uniqueTopics.map(topic => ({
      name: topic,
      count: quizzes.filter(q => q.topic === topic).length
    }))
  }, [quizzes])

  const handleStartQuiz = () => {
    if (!quizzes || quizzes.length === 0) return

    let processedQuizzes = [...quizzes]

    if (randomizeQuestions) {
      processedQuizzes = shuffleArray(processedQuizzes)
    }

    if (randomizeAnswers) {
      processedQuizzes = processedQuizzes.map((q) => ({
        ...q,
        respuestas: shuffleArray([...q.respuestas]),
      }))
    }

    setInitialIndex(0)
    setInitialResponses([])
    setShuffledQuizzes(processedQuizzes)
    setStarted(true)
  }

  const handleResumeQuiz = () => {
    if (!savedProgress) return
    setShuffledQuizzes(savedProgress.quizzes)
    setInitialIndex(savedProgress.currentIndex)
    setInitialResponses(savedProgress.responses)
    setStarted(true)
  }

  const handleClearProgress = () => {
    localStorage.removeItem('quiz_progress')
    setSavedProgress(null)
  }

  const handleImportSuccess = (questions: Question[]) => {
    localStorage.removeItem('quiz_progress')
    setSavedProgress(null)
    mutate(questions, false)
    setStarted(false)
    setActiveTab('quiz')
  }

  const isEmpty = !isLoading && (!quizzes || quizzes.length === 0)

  if (started && shuffledQuizzes.length > 0) {
    return (
      <QuizContainer
        quizzes={shuffledQuizzes}
        initialIndex={initialIndex}
        initialResponses={initialResponses}
        onExit={() => {
          setStarted(false)
          setShuffledQuizzes([])
          const saved = localStorage.getItem('quiz_progress')
          if (saved) {
            try {
              setSavedProgress(JSON.parse(saved))
            } catch {}
          } else {
            setSavedProgress(null)
          }
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
          <span className="text-lg font-bold text-foreground tracking-tight">QuizPro</span>
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'quiz'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Cuestionario
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'import'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Importar
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* QUIZ TAB */}
        {activeTab === 'quiz' && (
          <>
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Cargando cuestionario...</p>
              </div>
            )}

            {!isLoading && isEmpty && (
              <div className="text-center py-24 space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-foreground">No hay cuestionario cargado</h2>
                <p className="text-muted-foreground text-sm">
                  Importa un cuestionario desde la pestaña{' '}
                  <button
                    onClick={() => setActiveTab('import')}
                    className="text-primary underline underline-offset-2 hover:no-underline"
                  >
                    Importar
                  </button>{' '}
                  para comenzar.
                </p>
              </div>
            )}

            {!isLoading && !isEmpty && quizzes && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground text-balance">
                    Listo para comenzar
                  </h1>
                  <p className="text-muted-foreground">
                    {quizzes.length} pregunta{quizzes.length !== 1 ? 's' : ''} cargada{quizzes.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {savedProgress && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground">Cuestionario en curso detectado</h4>
                        <p className="text-xs text-muted-foreground">
                          Te quedaste en la pregunta {savedProgress.currentIndex + 1} de {savedProgress.quizzes.length}.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleResumeQuiz}
                        className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                      >
                        Reanudar cuestionario
                      </button>
                      <button
                        onClick={handleClearProgress}
                        className="text-xs border border-border hover:bg-muted text-muted-foreground hover:text-foreground font-semibold px-4 py-2.5 rounded-lg transition-colors"
                      >
                        Descartar progreso
                      </button>
                    </div>
                  </div>
                )}

                {/* Topics summary */}
                {topics.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Temas incluidos</h3>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic) => (
                        <span key={topic.name} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {topic.name}
                          <span className="bg-primary/20 text-primary rounded-full px-1.5 py-px text-xs font-semibold">{topic.count}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features list */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                  {[
                    'Feedback inmediato al responder cada pregunta',
                    'Soporte para múltiples respuestas correctas',
                    'Avanza, retrocede o saltea preguntas libremente',
                    'Resumen detallado al finalizar',
                  ].map((feat) => (
                    <div key={feat} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <p className="text-sm text-muted-foreground">{feat}</p>
                    </div>
                  ))}
                </div>

                {/* Randomization Options */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Opciones de juego</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={randomizeQuestions}
                          onChange={(e) => setRandomizeQuestions(e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="w-10 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Aleatorizar preguntas</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={randomizeAnswers}
                          onChange={(e) => setRandomizeAnswers(e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="w-10 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Aleatorizar respuestas</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleStartQuiz}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-colors text-base"
                >
                  Comenzar cuestionario
                </button>
              </div>
            )}
          </>
        )}

        {/* IMPORT TAB */}
        {activeTab === 'import' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Importar cuestionario</h2>
              <p className="text-muted-foreground text-sm mt-1">
                El cuestionario quedará guardado en el servidor y persistirá entre sesiones.
              </p>
            </div>
            <ImportTab onImportSuccess={handleImportSuccess} />
          </div>
        )}
      </main>
    </div>
  )
}
