-- ============================================================================
-- Migration: Course Sections (CONTENT-N-005)
-- Description: Supports structured courses with ordered sections.
--              Each section is either original rich content or a reference
--              to an existing published content (article, video, PDF).
-- PREREQUISITE: Run add_course_content_type.sql FIRST (separate transaction)
-- ============================================================================

-- Course sections table
CREATE TABLE IF NOT EXISTS course_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES educational_contents(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  -- Section type: 'original' (rich text written here) or 'reference' (link to existing content)
  section_type TEXT NOT NULL CHECK (section_type IN ('original', 'reference')),
  -- For 'original' sections: rich text body
  body TEXT,
  -- For 'reference' sections: link to existing educational_contents
  referenced_content_id UUID REFERENCES educational_contents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;

-- Nutritionists can manage sections on their own courses
CREATE POLICY "nutritionist_manage_course_sections"
ON course_sections
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = course_sections.course_id
      AND np.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = course_sections.course_id
      AND np.user_id = auth.uid()
  )
);

-- Patients can read sections of published courses from their nutritionist
CREATE POLICY "patient_read_course_sections"
ON course_sections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    JOIN patient_profiles pp ON pp.nutritionist_id = np.id
    WHERE ec.id = course_sections.course_id
      AND ec.status = 'published'
      AND ec.type = 'course'
      AND pp.user_id = auth.uid()
  )
);

CREATE INDEX idx_course_sections_course ON course_sections(course_id, sort_order);

-- Trigger updated_at
CREATE TRIGGER update_course_sections_updated_at
  BEFORE UPDATE ON course_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Patient course progress tracking
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES educational_contents(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (section_id, user_id)
);

ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_manage_own_course_progress"
ON course_progress
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "nutritionist_read_course_progress"
ON course_progress
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = course_progress.course_id
      AND np.user_id = auth.uid()
  )
);

CREATE INDEX idx_course_progress_course ON course_progress(course_id, user_id);
