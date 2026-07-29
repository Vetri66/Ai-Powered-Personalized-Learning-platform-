-- Enable vector extension if not already enabled (should be enabled for course_materials but good to be safe)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to chat_messages table
ALTER TABLE public.chat_messages
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create a function to match chat history based on embedding similarity
CREATE OR REPLACE FUNCTION match_chat_history (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  student_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  role text,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cm.id,
    cm.content,
    cm.role,
    cm.created_at,
    1 - (cm.embedding <=> query_embedding) as similarity
  FROM chat_messages cm
  JOIN chat_sessions cs ON cm.session_id = cs.id
  WHERE 1 - (cm.embedding <=> query_embedding) > match_threshold
  AND (student_filter IS NULL OR cs.student_id = student_filter) -- Filter RESTORED
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
