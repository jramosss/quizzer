'use client'

import { useState, useRef } from 'react'

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

interface ImportTabProps {
  onImportSuccess: (questions: Question[]) => void
}

const EXAMPLE_JSON = JSON.stringify(
  [
    {
      pregunta: "4.1 El PIB es el:",
      respuestas: [
        {
          text: "Valor de mercado de todos los bienes y servicios finales producidos en una economía en cierto período de tiempo",
          correcta: true
        },
        {
          text: "Valor de mercado de todos los bienes y servicios finales producidos en una economía por un período incierto",
          correcta: false
        }
      ],
      topic: "PBI: Definición y Cálculo"
    }
  ],
  null,
  2
)

export default function ImportTab({ onImportSuccess }: ImportTabProps) {
  const [jsonText, setJsonText] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [parseError, setParseError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndParse = (text: string): Question[] | null => {
    setParseError('')
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      setParseError('El texto no es un JSON válido. Revisá que las comillas, comas y corchetes estén correctos.')
      return null
    }

    if (!Array.isArray(parsed)) {
      setParseError('El JSON debe ser un array (lista) de preguntas, comenzando con [ y terminando con ].')
      return null
    }

    if (parsed.length === 0) {
      setParseError('El array no puede estar vacío. Debe contener al menos una pregunta.')
      return null
    }

    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i] as Record<string, unknown>
      if (typeof item.pregunta !== 'string') {
        setParseError(`Pregunta ${i + 1}: falta el campo "pregunta" (texto).`)
        return null
      }
      if (typeof item.topic !== 'undefined' && typeof item.topic !== 'string') {
        setParseError(`Pregunta ${i + 1}: el campo "topic" debe ser un texto cuando está presente.`)
        return null
      }
      if (typeof item.imagen !== 'undefined' && item.imagen !== null && typeof item.imagen !== 'string') {
        setParseError(`Pregunta ${i + 1}: el campo "imagen" debe ser un texto cuando está presente.`)
        return null
      }
      if (!Array.isArray(item.respuestas) || item.respuestas.length === 0) {
        setParseError(`Pregunta ${i + 1}: falta el campo "respuestas" o está vacío.`)
        return null
      }
      const anyCorrect = (item.respuestas as Record<string, unknown>[]).some(r => r.correcta === true)
      if (!anyCorrect) {
        setParseError(`Pregunta ${i + 1} ("${item.pregunta}"): debe tener al menos una respuesta con "correcta": true.`)
        return null
      }
      for (let j = 0; j < (item.respuestas as Record<string, unknown>[]).length; j++) {
        const r = (item.respuestas as Record<string, unknown>[])[j]
        const textValue = r.text ?? r.texto
        if (typeof textValue !== 'string') {
          setParseError(`Pregunta ${i + 1}, respuesta ${j + 1}: falta el campo "text" o "texto".`)
          return null
        }
        // Normalize "texto" → "text"
        if (r.texto !== undefined) {
          r.text = r.texto
          delete r.texto
        }
        if (typeof r.correcta !== 'boolean') {
          setParseError(`Pregunta ${i + 1}, respuesta ${j + 1}: "correcta" debe ser true o false (sin comillas).`)
          return null
        }
      }
    }

    return parsed as Question[]
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setJsonText(text)
      setParseError('')
      setStatus('idle')
      setMessage('')
    }
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    const questions = validateAndParse(jsonText)
    if (!questions) return

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questions),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Error desconocido al guardar.')
        return
      }
      setStatus('success')
      setMessage(`Cuestionario guardado correctamente. ${data.count} pregunta${data.count !== 1 ? 's' : ''} cargada${data.count !== 1 ? 's' : ''}.`)
      onImportSuccess(questions)
    } catch {
      setStatus('error')
      setMessage('No se pudo conectar con el servidor.')
    }
  }

  const handleLoadExample = () => {
    setJsonText(EXAMPLE_JSON)
    setParseError('')
    setStatus('idle')
    setMessage('')
  }

  const handleClear = () => {
    setJsonText('')
    setParseError('')
    setStatus('idle')
    setMessage('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const previewCount = (() => {
    try {
      const parsed = JSON.parse(jsonText)
      return Array.isArray(parsed) ? parsed.length : null
    } catch {
      return null
    }
  })()

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Schema reference */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Formato esperado</h3>
        <pre className="text-xs text-muted-foreground bg-muted rounded-lg p-4 overflow-x-auto leading-relaxed font-mono">
{`[
  {
    "pregunta": "Texto de la pregunta",
    "topic": "Nombre del tema (opcional)",
    "imagen": "images/nombre-imagen.png (opcional)",
    "respuestas": [
      { "text": "Opción correcta", "correcta": true },
      { "texto": "Opción incorrecta", "correcta": false }
    ]
  }
]`}
        </pre>
        <p className="text-xs text-muted-foreground">
          El array puede contener múltiples preguntas. Una pregunta puede tener más de una respuesta correcta. El campo del texto de cada respuesta acepta <code className="bg-muted px-1 rounded">"text"</code> o <code className="bg-muted px-1 rounded">"texto"</code>. Además se puede incluir una <code className="bg-muted px-1 rounded">"imagen"</code> opcional.
        </p>
      </div>

      {/* Upload area */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Editor JSON</h3>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              Subir archivo
            </button>
            <button
              onClick={handleLoadExample}
              className="text-xs px-3 py-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              Cargar ejemplo
            </button>
            {jsonText && (
              <button
                onClick={handleClear}
                className="text-xs px-3 py-1.5 border border-border rounded-lg text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="relative">
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value)
              setParseError('')
              setStatus('idle')
              setMessage('')
            }}
            placeholder='Pegá el JSON aquí o usá "Subir archivo" / "Cargar ejemplo"...'
            rows={14}
            className={`w-full font-mono text-sm bg-muted rounded-lg p-4 text-foreground placeholder:text-muted-foreground resize-y border-2 outline-none transition-colors ${
              parseError
                ? 'border-destructive'
                : jsonText && !parseError
                ? 'border-primary/30'
                : 'border-transparent focus:border-primary/30'
            }`}
            spellCheck={false}
          />
          {previewCount !== null && !parseError && (
            <span className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-muted/80 px-2 py-0.5 rounded">
              {previewCount} pregunta{previewCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Validation error */}
        {parseError && (
          <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <svg className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm text-destructive">{parseError}</p>
          </div>
        )}

        {/* Server status */}
        {status === 'success' && (
          <div className="flex gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-800 rounded-lg">
            <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <svg className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm text-destructive">{message}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!jsonText.trim() || status === 'loading'}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar cuestionario'
          )}
        </button>
      </div>
    </div>
  )
}
