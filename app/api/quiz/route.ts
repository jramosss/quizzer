import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const rows = await sql`SELECT questions FROM quiz_data WHERE id = 1`
    if (rows.length === 0) {
      return NextResponse.json([])
    }
    return NextResponse.json(rows[0].questions)
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
        !Array.isArray(item.respuestas) ||
        typeof item.topic !== 'string'
      ) {
        return NextResponse.json(
          { error: 'Formato inválido. Cada pregunta debe tener "pregunta", "respuestas" y "topic"' },
          { status: 400 }
        )
      }
      for (const r of item.respuestas) {
        if (typeof r.text !== 'string' || typeof r.correcta !== 'boolean') {
          return NextResponse.json(
            { error: 'Cada respuesta debe tener "text" (string) y "correcta" (boolean)' },
            { status: 400 }
          )
        }
      }
    }

    await sql`
      INSERT INTO quiz_data (id, questions)
      VALUES (1, ${JSON.stringify(body)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET questions = EXCLUDED.questions, updated_at = NOW()
    `

    return NextResponse.json({ success: true, count: body.length })
  } catch (error) {
    console.error('[quiz/POST]', error)
    return NextResponse.json({ error: 'Error al guardar el cuestionario' }, { status: 500 })
  }
}
