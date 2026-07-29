-- Run this in Supabase SQL Editor

-- 1. Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Drop existing functions first
DROP FUNCTION IF EXISTS match_course_content(vector, float, int);
DROP FUNCTION IF EXISTS match_chat_history(vector, float, int, uuid);
DROP FUNCTION IF EXISTS match_course_content(vector(768), float, int);
DROP FUNCTION IF EXISTS match_chat_history(vector(768), float, int, uuid);

-- 3. Recreate course_materials with vector(1024)
DROP TABLE IF EXISTS public.course_materials CASCADE;
CREATE TABLE public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1024),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Recreate chat_messages with vector(1024)
DROP TABLE IF EXISTS public.chat_messages CASCADE;
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  embedding vector(1024),
  confidence DECIMAL(3,2),
  sources JSONB,
  follow_up_questions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. match_course_content function
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
  SELECT id, content, metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM course_materials
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 6. match_chat_history function
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

-- 7. Indexes
CREATE INDEX ON course_materials USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON chat_messages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 8. RLS
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_course_materials" ON public.course_materials;
CREATE POLICY "allow_all_course_materials" ON public.course_materials FOR ALL USING (true);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat_messages_select_own" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_own" ON public.chat_messages;
DROP POLICY IF EXISTS "service_role_all_messages" ON public.chat_messages;
CREATE POLICY "chat_messages_select_own" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_sessions WHERE id = session_id AND student_id = auth.uid())
);
CREATE POLICY "chat_messages_insert_own" ON public.chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.chat_sessions WHERE id = session_id AND student_id = auth.uid())
);
CREATE POLICY "service_role_all_messages" ON public.chat_messages FOR ALL USING (true);
