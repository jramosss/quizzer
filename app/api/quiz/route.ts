import { NextResponse } from 'next/server'
import { db, initDb } from '@/lib/db'

export async function GET() {
  try {
    await initDb()
    const result = await db.execute({
      sql: 'SELECT questions FROM quiz_data WHERE id = 1',
      args: []
    })

    if (result.rows.length === 0 || !result.rows[0].questions) {
      return NextResponse.json([])
    }

    return NextResponse.json(JSON.parse(result.rows[0].questions as string))
  } catch (error) {
    console.error('[quiz/GET]', error)
    return NextResponse.json({ error: 'Error al cargar el cuestionario' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'El JSON debe ser un array de preguntas' },
        { status: 400 }
      )
    }

    for (const item of body) {
      if (
        typeof item.pregunta !== 'string' ||
        !Array.isArray(item.respuestas)
      ) {
        return NextResponse.json(
          { error: 'Formato inválido. Cada pregunta debe tener "pregunta" y "respuestas"' },
          { status: 400 }
        )
      }
      if (item.topic !== undefined && typeof item.topic !== 'string') {
        return NextResponse.json(
          { error: 'El campo "topic" debe ser un texto cuando está presente' },
          { status: 400 }
        )
      }
      if (item.imagen !== undefined && item.imagen !== null && typeof item.imagen !== 'string') {
        return NextResponse.json(
          { error: 'El campo "imagen" debe ser un texto cuando está presente' },
          { status: 400 }
        )
      }
      for (const r of item.respuestas as Record<string, unknown>[]) {
        const textValue = r.text ?? r.texto
        if (typeof textValue !== 'string' || typeof r.correcta !== 'boolean') {
          return NextResponse.json(
            { error: 'Cada respuesta debe tener "text" o "texto" (string) y "correcta" (boolean)' },
            { status: 400 }
          )
        }
        if (r.texto !== undefined) {
          r.text = r.texto
          delete r.texto
        }
      }
    }

    await initDb()
    await db.execute({
      sql: `
        INSERT INTO quiz_data (id, questions, updated_at)
        VALUES (1, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET questions = excluded.questions, updated_at = excluded.updated_at
      `,
      args: [JSON.stringify(body)]
    })

    return NextResponse.json({ success: true, count: body.length })
  } catch (error) {
    console.error('[quiz/POST]', error)
    return NextResponse.json({ error: 'Error al guardar el cuestionario' }, { status: 500 })
  }
}
