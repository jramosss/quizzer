'use client'

import { useState, useEffect } from 'react'
import QuizContainer from '@/components/quiz-container'

interface Question {
  pregunta: string
  respuestas: Array<{
    text: string
    correcta: boolean
  }>
  topic: string
}

export default function Home() {
  const [started, setStarted] = useState(false)
  const [quizzes, setQuizzes] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const response = await fetch('/quiz-data.json')
        const data = await response.json()
        setQuizzes(data)
      } catch (error) {
        console.error('Error loading quiz data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadQuizData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando cuestionario...</p>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-foreground">
              QuizPro
            </h1>
            <p className="text-xl text-muted-foreground">
              Plataforma de cuestionarios interactiva para aprender y practicar
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2 text-foreground">
                Bienvenido
              </h2>
              <p className="text-muted-foreground">
                Responde preguntas de opción múltiple, navega libremente entre
                preguntas y evaluate tu conocimiento en diferentes temas.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  ✓
                </div>
                <p className="text-sm text-muted-foreground">
                  Responde múltiples opciones cuando sea necesario
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  ✓
                </div>
                <p className="text-sm text-muted-foreground">
                  Avanza, retrocede o saltea preguntas
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  ✓
                </div>
                <p className="text-sm text-muted-foreground">
                  Visualiza tu progreso en tiempo real
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  ✓
                </div>
                <p className="text-sm text-muted-foreground">
                  Obtén feedback inmediato de cada respuesta
                </p>
              </div>
            </div>

            <button
              onClick={() => setStarted(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Comenzar Cuestionario
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <QuizContainer quizzes={quizzes} />
}
