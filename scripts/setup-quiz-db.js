import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS quiz_data (
    id SERIAL PRIMARY KEY,
    questions JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS quiz_data_singleton ON quiz_data ((true))
`;

console.log("quiz_data table created successfully.");
