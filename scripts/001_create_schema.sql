-- AI-Powered E-Learning Platform Schema
-- This script creates all necessary tables for the platform

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";



-- User Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'educator', 'admin')),
  bio TEXT,
  institution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  educator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_published BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course Materials table (PDFs, notes, slides)
CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  content_text TEXT, -- Extracted text for AI processing
  embeddings TEXT, -- Store embeddings as JSON string for flexibility
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- AI Chat Sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Chat Messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  confidence_score DECIMAL(3, 2),
  source_references JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Progress table (tracks mastery per topic)
CREATE TABLE IF NOT EXISTS public.learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  interactions_count INTEGER DEFAULT 0,
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id, topic)
);

-- Student Analytics table
CREATE TABLE IF NOT EXISTS public.student_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  study_time_minutes INTEGER DEFAULT 0,
  questions_asked INTEGER DEFAULT 0,
  hints_requested INTEGER DEFAULT 0,
  weak_topics JSONB DEFAULT '[]',
  strong_topics JSONB DEFAULT '[]',
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Course Analytics table (for educators)
CREATE TABLE IF NOT EXISTS public.course_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  total_enrollments INTEGER DEFAULT 0,
  active_students INTEGER DEFAULT 0,
  avg_completion_rate DECIMAL(5, 2) DEFAULT 0,
  most_asked_questions JSONB DEFAULT '[]',
  confusing_topics JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_analytics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);

-- Courses policies
CREATE POLICY "courses_select_published" ON public.courses FOR SELECT USING (is_published = true OR educator_id = auth.uid());
CREATE POLICY "courses_insert_educator" ON public.courses FOR INSERT WITH CHECK (educator_id = auth.uid());
CREATE POLICY "courses_update_educator" ON public.courses FOR UPDATE USING (educator_id = auth.uid());
CREATE POLICY "courses_delete_educator" ON public.courses FOR DELETE USING (educator_id = auth.uid());

-- Course Materials policies
CREATE POLICY "materials_select_enrolled" ON public.course_materials FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = course_id AND (
      c.educator_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = c.id AND e.student_id = auth.uid())
    )
  )
);
CREATE POLICY "materials_insert_educator" ON public.course_materials FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND educator_id = auth.uid())
);
CREATE POLICY "materials_delete_educator" ON public.course_materials FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND educator_id = auth.uid())
);

-- Enrollments policies
CREATE POLICY "enrollments_select_own" ON public.enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "enrollments_insert_own" ON public.enrollments FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "enrollments_select_educator" ON public.enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND educator_id = auth.uid())
);

-- Chat Sessions policies
CREATE POLICY "chat_sessions_select_own" ON public.chat_sessions FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "chat_sessions_insert_own" ON public.chat_sessions FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "chat_sessions_update_own" ON public.chat_sessions FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "chat_sessions_delete_own" ON public.chat_sessions FOR DELETE USING (student_id = auth.uid());

-- Chat Messages policies
CREATE POLICY "chat_messages_select_own" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_sessions WHERE id = session_id AND student_id = auth.uid())
);
CREATE POLICY "chat_messages_insert_own" ON public.chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.chat_sessions WHERE id = session_id AND student_id = auth.uid())
);

-- Learning Progress policies
CREATE POLICY "learning_progress_select_own" ON public.learning_progress FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "learning_progress_insert_own" ON public.learning_progress FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "learning_progress_update_own" ON public.learning_progress FOR UPDATE USING (student_id = auth.uid());

-- Student Analytics policies
CREATE POLICY "student_analytics_select_own" ON public.student_analytics FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "student_analytics_insert_own" ON public.student_analytics FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "student_analytics_update_own" ON public.student_analytics FOR UPDATE USING (student_id = auth.uid());

-- Course Analytics policies (educators can view their course analytics)
CREATE POLICY "course_analytics_select_educator" ON public.course_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND educator_id = auth.uid())
);
CREATE POLICY "course_analytics_insert_educator" ON public.course_analytics FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND educator_id = auth.uid())
);
CREATE POLICY "course_analytics_update_educator" ON public.course_analytics FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND educator_id = auth.uid())
);

-- Create trigger function for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
