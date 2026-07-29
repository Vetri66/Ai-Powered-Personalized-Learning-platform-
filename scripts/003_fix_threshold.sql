-- Run this in Supabase SQL Editor

-- Drop and recreate with lower threshold support
DROP FUNCTION IF EXISTS match_course_content(vector(1024), float, int);

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

-- Test: manually check similarity scores
-- Run this to see what scores your data gets:
-- SELECT LEFT(content, 80), 1 - (embedding <=> (SELECT embedding FROM course_materials LIMIT 1)) as sim
-- FROM course_materials LIMIT 5;
