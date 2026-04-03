CREATE TABLE IF NOT EXISTS quiz_data (
  id SERIAL PRIMARY KEY,
  questions JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure only one row ever exists (singleton pattern)
CREATE UNIQUE INDEX IF NOT EXISTS quiz_data_singleton ON quiz_data ((true));
