-- ============================================================================
-- Migration: Course Structure (Cours educatifs - Epic Cours)
-- Description: Full 3-level course structure (Course → Chapters → Sections → Blocks),
--              quizzes, prerequisites, progress tracking, badges.
--              REPLACES the old create_course_sections.sql (2-level structure).
-- PREREQUISITES:
--   - create_educational_content.sql (educational_contents table)
--   - add_course_content_type.sql (content_type enum includes 'course')
-- ============================================================================

-- =============================================================
-- 0. DROP OLD TABLES (from create_course_sections.sql)
-- =============================================================

-- Drop old course_progress first (depends on old course_sections)
DROP TABLE IF EXISTS course_progress CASCADE;
-- Drop old course_sections
DROP TABLE IF EXISTS course_sections CASCADE;

-- =============================================================
-- 1. COURSE CHAPTERS
-- =============================================================

CREATE TABLE IF NOT EXISTS course_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES educational_contents(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description TEXT CHECK (char_length(description) <= 1000),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE course_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutritionist_manage_course_chapters"
ON course_chapters FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = course_chapters.course_id
      AND np.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = course_chapters.course_id
      AND np.user_id = auth.uid()
  )
);

CREATE POLICY "patient_read_course_chapters"
ON course_chapters FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    JOIN patient_profiles pp ON pp.nutritionist_id = np.id
    WHERE ec.id = course_chapters.course_id
      AND ec.status = 'published'
      AND ec.type = 'course'
      AND pp.user_id = auth.uid()
  )
);

CREATE INDEX idx_course_chapters_course ON course_chapters(course_id, sort_order);

CREATE TRIGGER update_course_chapters_updated_at
  BEFORE UPDATE ON course_chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- 2. COURSE SECTIONS
-- =============================================================

CREATE TABLE IF NOT EXISTS course_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES course_chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  sort_order INTEGER NOT NULL DEFAULT 0,
  -- Type: 'blocks' (original multi-block content) or 'reference' (link to existing content)
  section_type TEXT NOT NULL CHECK (section_type IN ('blocks', 'reference')),
  -- For 'reference': link to existing educational_contents
  referenced_content_id UUID REFERENCES educational_contents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutritionist_manage_course_sections"
ON course_sections FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM course_chapters cc
    JOIN educational_contents ec ON ec.id = cc.course_id
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE cc.id = course_sections.chapter_id
      AND np.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM course_chapters cc
    JOIN educational_contents ec ON ec.id = cc.course_id
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE cc.id = course_sections.chapter_id
      AND np.user_id = auth.uid()
  )
);

CREATE POLICY "patient_read_course_sections"
ON course_sections FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM course_chapters cc
    JOIN educational_contents ec ON ec.id = cc.course_id
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    JOIN patient_profiles pp ON pp.nutritionist_id = np.id
    WHERE cc.id = course_sections.chapter_id
      AND ec.status = 'published'
      AND ec.type = 'course'
      AND pp.user_id = auth.uid()
  )
);

CREATE INDEX idx_course_sections_chapter ON course_sections(chapter_id, sort_order);

CREATE TRIGGER update_course_sections_updated_at
  BEFORE UPDATE ON course_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- 3. COURSE SECTION BLOCKS
-- =============================================================

CREATE TABLE IF NOT EXISTS course_section_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  block_type TEXT NOT NULL CHECK (block_type IN ('rich_text', 'video', 'pdf', 'image')),
  -- For 'rich_text': HTML from Tiptap
  body TEXT,
  -- For 'video': embedded URL
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('youtube', 'vimeo')),
  -- For 'pdf'/'image': Supabase Storage URL
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE course_section_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutritionist_manage_section_blocks"
ON course_section_blocks FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM course_sections cs
    JOIN course_chapters cc ON cc.id = cs.chapter_id
    JOIN educational_contents ec ON ec.id = cc.course_id
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE cs.id = course_section_blocks.section_id
      AND np.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM course_sections cs
    JOIN course_chapters cc ON cc.id = cs.chapter_id
    JOIN educational_contents ec ON ec.id = cc.course_id
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE cs.id = course_section_blocks.section_id
      AND np.user_id = auth.uid()
  )
);

CREATE POLICY "patient_read_section_blocks"
ON course_section_blocks FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM course_sections cs
    JOIN course_chapters cc ON cc.id = cs.chapter_id
    JOIN educational_contents ec ON ec.id = cc.course_id
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    JOIN patient_profiles pp ON pp.nutritionist_id = np.id
    WHERE cs.id = course_section_blocks.section_id
      AND ec.status = 'published'
      AND ec.type = 'course'
      AND pp.user_id = auth.uid()
  )
);

CREATE INDEX idx_section_blocks_section ON course_section_blocks(section_id, sort_order);

CREATE TRIGGER update_section_blocks_updated_at
  BEFORE UPDATE ON course_section_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- 4. COURSE QUIZZES
-- =============================================================

CREATE TABLE IF NOT EXISTS course_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES educational_contents(id) ON DELETE CASCADE,
  -- NULL = final quiz of the course, otherwise chapter quiz
  chapter_id UUID REFERENCES course_chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description TEXT CHECK (char_length(description) <= 1000),
  passing_score INTEGER NOT NULL DEFAULT 70 CHECK (passing_score BETWEEN 0 AND 100),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE course_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutritionist_manage_quizzes"
ON course_quizzes FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = course_quizzes.course_id
      AND np.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = course_quizzes.course_id
      AND np.user_id = auth.uid()
  )
);

CREATE POLICY "patient_read_quizzes"
ON course_quizzes FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    JOIN patient_profiles pp ON pp.nutritionist_id = np.id
    WHERE ec.id = course_quizzes.course_id
      AND ec.status = 'published'
      AND ec.type = 'course'
      AND pp.user_id = auth.uid()
  )
);

CREATE INDEX idx_course_quizzes_course ON course_quizzes(course_id);
CREATE INDEX idx_course_quizzes_chapter ON course_quizzes(chapter_id);

CREATE TRIGGER update_course_quizzes_updated_at
  BEFORE UPDATE ON course_quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- 5. QUIZ QUESTIONS
-- =============================================================

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES course_quizzes(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'true_false')),
  question_text TEXT NOT NULL CHECK (char_length(question_text) BETWEEN 1 AND 2000),
  -- For MCQ: [{text: string, is_correct: boolean}]
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- For true_false: the correct answer
  correct_answer BOOLEAN,
  -- Explanation shown after answering
  explanation TEXT CHECK (char_length(explanation) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutritionist_manage_quiz_questions"
ON quiz_questions FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM course_quizzes cq
    JOIN educational_contents ec ON ec.id = cq.course_id
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE cq.id = quiz_questions.quiz_id
      AND np.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM course_quizzes cq
    JOIN educational_contents ec ON ec.id = cq.course_id
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE cq.id = quiz_questions.quiz_id
      AND np.user_id = auth.uid()
  )
);

CREATE POLICY "patient_read_quiz_questions"
ON quiz_questions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM course_quizzes cq
    JOIN educational_contents ec ON ec.id = cq.course_id
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    JOIN patient_profiles pp ON pp.nutritionist_id = np.id
    WHERE cq.id = quiz_questions.quiz_id
      AND ec.status = 'published'
      AND ec.type = 'course'
      AND pp.user_id = auth.uid()
  )
);

CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id, sort_order);

-- =============================================================
-- 6. QUIZ ATTEMPTS
-- =============================================================

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES course_quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- [{question_id: uuid, selected_options: number[] (for mcq) | answer: boolean (for true_false)}]
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_manage_own_quiz_attempts"
ON quiz_attempts FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "nutritionist_read_quiz_attempts"
ON quiz_attempts FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM course_quizzes cq
    JOIN educational_contents ec ON ec.id = cq.course_id
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE cq.id = quiz_attempts.quiz_id
      AND np.user_id = auth.uid()
  )
);

CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id, user_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);

-- =============================================================
-- 7. COURSE PREREQUISITES
-- =============================================================

CREATE TABLE IF NOT EXISTS course_prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES educational_contents(id) ON DELETE CASCADE,
  prerequisite_course_id UUID NOT NULL REFERENCES educational_contents(id) ON DELETE CASCADE,
  require_completion BOOLEAN NOT NULL DEFAULT TRUE,
  require_quiz_score BOOLEAN NOT NULL DEFAULT FALSE,
  min_quiz_score INTEGER NOT NULL DEFAULT 70 CHECK (min_quiz_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_prerequisite UNIQUE (course_id, prerequisite_course_id),
  CONSTRAINT no_self_prerequisite CHECK (course_id != prerequisite_course_id)
);

ALTER TABLE course_prerequisites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutritionist_manage_prerequisites"
ON course_prerequisites FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = course_prerequisites.course_id
      AND np.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = course_prerequisites.course_id
      AND np.user_id = auth.uid()
  )
);

CREATE POLICY "patient_read_prerequisites"
ON course_prerequisites FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    JOIN patient_profiles pp ON pp.nutritionist_id = np.id
    WHERE ec.id = course_prerequisites.course_id
      AND ec.status = 'published'
      AND pp.user_id = auth.uid()
  )
);

CREATE INDEX idx_course_prerequisites_course ON course_prerequisites(course_id);

-- =============================================================
-- 8. COURSE PROGRESS (section-level)
-- =============================================================

CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES educational_contents(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_section_progress UNIQUE (section_id, user_id)
);

ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_manage_own_course_progress"
ON course_progress FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "nutritionist_read_course_progress"
ON course_progress FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = course_progress.course_id
      AND np.user_id = auth.uid()
  )
);

CREATE INDEX idx_course_progress_course_user ON course_progress(course_id, user_id);
CREATE INDEX idx_course_progress_section ON course_progress(section_id);

-- =============================================================
-- 9. COURSE BADGES
-- =============================================================

CREATE TABLE IF NOT EXISTS course_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES educational_contents(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL CHECK (char_length(badge_name) BETWEEN 1 AND 100),
  badge_icon TEXT NOT NULL, -- emoji or icon URL
  points_awarded INTEGER NOT NULL DEFAULT 50 CHECK (points_awarded >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_course_badge UNIQUE (course_id)
);

ALTER TABLE course_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutritionist_manage_course_badges"
ON course_badges FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = course_badges.course_id
      AND np.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = course_badges.course_id
      AND np.user_id = auth.uid()
  )
);

CREATE POLICY "patient_read_course_badges"
ON course_badges FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    JOIN patient_profiles pp ON pp.nutritionist_id = np.id
    WHERE ec.id = course_badges.course_id
      AND ec.status = 'published'
      AND pp.user_id = auth.uid()
  )
);

-- =============================================================
-- 10. EARNED BADGES
-- =============================================================

CREATE TABLE IF NOT EXISTS earned_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id UUID NOT NULL REFERENCES course_badges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_earned_badge UNIQUE (badge_id, user_id)
);

ALTER TABLE earned_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_read_own_earned_badges"
ON earned_badges FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "user_insert_own_earned_badges"
ON earned_badges FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "nutritionist_read_earned_badges"
ON earned_badges FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM course_badges cb
    JOIN educational_contents ec ON ec.id = cb.course_id
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE cb.id = earned_badges.badge_id
      AND np.user_id = auth.uid()
  )
);

CREATE INDEX idx_earned_badges_user ON earned_badges(user_id);
CREATE INDEX idx_earned_badges_badge ON earned_badges(badge_id);

-- =============================================================
-- 11. HELPER FUNCTIONS
-- =============================================================

-- Get course completion percentage for a user
CREATE OR REPLACE FUNCTION get_course_completion(p_course_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_sections INTEGER;
  completed_sections INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_sections
  FROM course_sections cs
  JOIN course_chapters cc ON cc.id = cs.chapter_id
  WHERE cc.course_id = p_course_id;

  IF total_sections = 0 THEN RETURN 0; END IF;

  SELECT COUNT(*) INTO completed_sections
  FROM course_progress cp
  WHERE cp.course_id = p_course_id
    AND cp.user_id = p_user_id
    AND cp.completed_at IS NOT NULL;

  RETURN ROUND((completed_sections::NUMERIC / total_sections) * 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get best quiz score for final quiz of a course
CREATE OR REPLACE FUNCTION get_course_final_quiz_score(p_course_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  best_score INTEGER;
BEGIN
  SELECT MAX(qa.score) INTO best_score
  FROM quiz_attempts qa
  JOIN course_quizzes cq ON cq.id = qa.quiz_id
  WHERE cq.course_id = p_course_id
    AND cq.chapter_id IS NULL -- final quiz
    AND qa.user_id = p_user_id;

  RETURN COALESCE(best_score, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if a user meets all prerequisites for a course
CREATE OR REPLACE FUNCTION check_course_prerequisites(p_course_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  prereq RECORD;
  completion INTEGER;
  quiz_score INTEGER;
BEGIN
  FOR prereq IN
    SELECT * FROM course_prerequisites WHERE course_id = p_course_id
  LOOP
    IF prereq.require_completion THEN
      completion := get_course_completion(prereq.prerequisite_course_id, p_user_id);
      IF completion < 100 THEN RETURN FALSE; END IF;
    END IF;

    IF prereq.require_quiz_score THEN
      quiz_score := get_course_final_quiz_score(prereq.prerequisite_course_id, p_user_id);
      IF quiz_score < prereq.min_quiz_score THEN RETURN FALSE; END IF;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Duplicate a course (structure only, no progress data)
CREATE OR REPLACE FUNCTION duplicate_course(p_course_id UUID, p_new_title TEXT)
RETURNS UUID AS $$
DECLARE
  v_new_course_id UUID;
  v_nutritionist_id UUID;
  v_old_chapter RECORD;
  v_new_chapter_id UUID;
  v_old_section RECORD;
  v_new_section_id UUID;
  v_old_block RECORD;
  v_old_quiz RECORD;
  v_new_quiz_id UUID;
  v_old_question RECORD;
BEGIN
  -- Get nutritionist_id from original course
  SELECT nutritionist_id INTO v_nutritionist_id
  FROM educational_contents WHERE id = p_course_id;

  -- Create new course content entry
  INSERT INTO educational_contents (nutritionist_id, type, category, status, title, slug, summary, tags, key_points)
  SELECT nutritionist_id, type, category, 'draft', p_new_title,
         generate_content_slug(p_new_title) || '-' || substring(gen_random_uuid()::text from 1 for 8),
         summary, tags, key_points
  FROM educational_contents WHERE id = p_course_id
  RETURNING id INTO v_new_course_id;

  -- Duplicate chapters
  FOR v_old_chapter IN
    SELECT * FROM course_chapters WHERE course_id = p_course_id ORDER BY sort_order
  LOOP
    INSERT INTO course_chapters (course_id, title, description, sort_order)
    VALUES (v_new_course_id, v_old_chapter.title, v_old_chapter.description, v_old_chapter.sort_order)
    RETURNING id INTO v_new_chapter_id;

    -- Duplicate sections for this chapter
    FOR v_old_section IN
      SELECT * FROM course_sections WHERE chapter_id = v_old_chapter.id ORDER BY sort_order
    LOOP
      INSERT INTO course_sections (chapter_id, title, sort_order, section_type, referenced_content_id)
      VALUES (v_new_chapter_id, v_old_section.title, v_old_section.sort_order, v_old_section.section_type, v_old_section.referenced_content_id)
      RETURNING id INTO v_new_section_id;

      -- Duplicate blocks for this section
      FOR v_old_block IN
        SELECT * FROM course_section_blocks WHERE section_id = v_old_section.id ORDER BY sort_order
      LOOP
        INSERT INTO course_section_blocks (section_id, sort_order, block_type, body, media_url, media_type, file_url, file_name, file_size)
        VALUES (v_new_section_id, v_old_block.sort_order, v_old_block.block_type, v_old_block.body, v_old_block.media_url, v_old_block.media_type, v_old_block.file_url, v_old_block.file_name, v_old_block.file_size);
      END LOOP;

      -- Duplicate chapter quizzes
      FOR v_old_quiz IN
        SELECT * FROM course_quizzes WHERE course_id = p_course_id AND chapter_id = v_old_chapter.id ORDER BY sort_order
      LOOP
        INSERT INTO course_quizzes (course_id, chapter_id, title, description, passing_score, sort_order)
        VALUES (v_new_course_id, v_new_chapter_id, v_old_quiz.title, v_old_quiz.description, v_old_quiz.passing_score, v_old_quiz.sort_order)
        RETURNING id INTO v_new_quiz_id;

        -- Duplicate questions
        FOR v_old_question IN
          SELECT * FROM quiz_questions WHERE quiz_id = v_old_quiz.id ORDER BY sort_order
        LOOP
          INSERT INTO quiz_questions (quiz_id, sort_order, question_type, question_text, options, correct_answer, explanation)
          VALUES (v_new_quiz_id, v_old_question.sort_order, v_old_question.question_type, v_old_question.question_text, v_old_question.options, v_old_question.correct_answer, v_old_question.explanation);
        END LOOP;
      END LOOP;
    END LOOP;
  END LOOP;

  -- Duplicate final course quizzes (chapter_id IS NULL)
  FOR v_old_quiz IN
    SELECT * FROM course_quizzes WHERE course_id = p_course_id AND chapter_id IS NULL ORDER BY sort_order
  LOOP
    INSERT INTO course_quizzes (course_id, chapter_id, title, description, passing_score, sort_order)
    VALUES (v_new_course_id, NULL, v_old_quiz.title, v_old_quiz.description, v_old_quiz.passing_score, v_old_quiz.sort_order)
    RETURNING id INTO v_new_quiz_id;

    FOR v_old_question IN
      SELECT * FROM quiz_questions WHERE quiz_id = v_old_quiz.id ORDER BY sort_order
    LOOP
      INSERT INTO quiz_questions (quiz_id, sort_order, question_type, question_text, options, correct_answer, explanation)
      VALUES (v_new_quiz_id, v_old_question.sort_order, v_old_question.question_type, v_old_question.question_text, v_old_question.options, v_old_question.correct_answer, v_old_question.explanation);
    END LOOP;
  END LOOP;

  -- Duplicate badge config
  INSERT INTO course_badges (course_id, badge_name, badge_icon, points_awarded)
  SELECT v_new_course_id, badge_name, badge_icon, points_awarded
  FROM course_badges WHERE course_id = p_course_id
  ON CONFLICT DO NOTHING;

  RETURN v_new_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- Verification
-- =============================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration create_course_structure terminee avec succes';
  RAISE NOTICE 'Tables creees: course_chapters, course_sections, course_section_blocks, course_quizzes, quiz_questions, quiz_attempts, course_prerequisites, course_progress, course_badges, earned_badges';
  RAISE NOTICE 'Fonctions creees: get_course_completion, get_course_final_quiz_score, check_course_prerequisites, duplicate_course';
END $$;
