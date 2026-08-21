import { createClient, type Client } from '@libsql/client'
import path from 'node:path'
import fs from 'node:fs'

const DB_DIR = process.env.DB_DIR || path.join(process.cwd(), 'data')
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

const DB_FILE = process.env.DATABASE_PATH || path.join(DB_DIR, 'quiz.db')
const DB_URL = DB_FILE.startsWith('file:') ? DB_FILE : `file:${DB_FILE}`

const globalForDb = global as unknown as { db?: Client; initPromise?: Promise<void> }

export const db: Client = globalForDb.db ?? createClient({ url: DB_URL })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db
}

export async function initDb(): Promise<void> {
  if (!globalForDb.initPromise) {
    globalForDb.initPromise = (async () => {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS quiz_data (
          id INTEGER PRIMARY KEY,
          questions TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `)
    })()
  }
  return globalForDb.initPromise
}
