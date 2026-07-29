-- Run this in Supabase SQL Editor

-- Step 1: Drop existing indexes
DROP INDEX IF EXISTS course_materials_embedding_idx;
DROP INDEX IF EXISTS chat_messages_embedding_idx;

-- Step 2: Drop existing functions
DROP FUNCTION IF EXISTS match_course_content(vector, float, int);
DROP FUNCTION IF EXISTS match_course_content(vector(1024), float, int);
DROP FUNCTION IF EXISTS match_chat_history(vector, float, int, uuid);
DROP FUNCTION IF EXISTS match_chat_history(vector(1024), float, int, uuid);

-- Step 3: Fix course_materials embedding column type
ALTER TABLE course_materials DROP COLUMN IF EXISTS embedding;
ALTER TABLE course_materials ADD COLUMN embedding vector(1024);

-- Step 4: Fix chat_messages embedding column type  
ALTER TABLE chat_messages DROP COLUMN IF EXISTS embedding;
ALTER TABLE chat_messages ADD COLUMN embedding vector(1024);

-- Step 5: Recreate match_course_content
CREATE OR REPLACE FUNCTION match_course_content(
  query_embedding vector(1024),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE sql STABLE AS $$
  SELECT
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM course_materials
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Step 6: Recreate match_chat_history
CREATE OR REPLACE FUNCTION match_chat_history(
  query_embedding vector(1024),
  match_threshold float,
  match_count int,
  student_filter UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  similarity float
)
LANGUAGE sql STABLE AS $$
  SELECT m.id, m.content, m.role, m.created_at,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM chat_messages m
  JOIN chat_sessions s ON s.id = m.session_id
  WHERE s.student_id = student_filter
    AND m.embedding IS NOT NULL
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Step 7: Recreate indexes
CREATE INDEX ON course_materials USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
CREATE INDEX ON chat_messages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
