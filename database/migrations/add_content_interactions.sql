-- ============================================================================
-- Migration: Content Interactions (likes, comments, versions, assignments)
-- Stories: CONTENT-N-007, N-010, N-012, N-013
-- ============================================================================

-- ─────────────────────────────────────────────────────────────
-- 1. CONTENT LIKES (CONTENT-N-012)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES educational_contents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (content_id, user_id)
);

ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;

-- Patients can like/unlike published content from their nutritionist
CREATE POLICY "user_manage_own_likes"
ON content_likes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    JOIN patient_profiles pp ON pp.nutritionist_id = np.id
    WHERE ec.id = content_likes.content_id
      AND ec.status = 'published'
      AND pp.user_id = auth.uid()
  )
);

-- Nutritionists can see likes on their content
CREATE POLICY "nutritionist_read_content_likes"
ON content_likes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = content_likes.content_id
      AND np.user_id = auth.uid()
  )
);

CREATE INDEX idx_content_likes_content ON content_likes(content_id);
CREATE INDEX idx_content_likes_user ON content_likes(user_id);

-- Add like_count to educational_contents (denormalized)
ALTER TABLE educational_contents
  ADD COLUMN IF NOT EXISTS like_count INTEGER NOT NULL DEFAULT 0;

-- Trigger to update like_count
CREATE OR REPLACE FUNCTION update_content_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE educational_contents
    SET like_count = like_count + 1
    WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE educational_contents
    SET like_count = GREATEST(0, like_count - 1)
    WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_content_like_count
  AFTER INSERT OR DELETE ON content_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_content_like_count();

-- ─────────────────────────────────────────────────────────────
-- 2. CONTENT COMMENTS (CONTENT-N-013)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES educational_contents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES content_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  is_nutritionist BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE content_comments ENABLE ROW LEVEL SECURITY;

-- Patients can read comments on published content from their nutritionist
CREATE POLICY "patient_read_content_comments"
ON content_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    JOIN patient_profiles pp ON pp.nutritionist_id = np.id
    WHERE ec.id = content_comments.content_id
      AND ec.status = 'published'
      AND pp.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = content_comments.content_id
      AND np.user_id = auth.uid()
  )
);

-- Patients can create comments
CREATE POLICY "patient_create_comment"
ON content_comments
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    JOIN patient_profiles pp ON pp.nutritionist_id = np.id
    WHERE ec.id = content_comments.content_id
      AND ec.status = 'published'
      AND pp.user_id = auth.uid()
  )
);

-- Nutritionists can create replies on their own content
CREATE POLICY "nutritionist_create_comment"
ON content_comments
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND is_nutritionist = TRUE
  AND EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = content_comments.content_id
      AND np.user_id = auth.uid()
  )
);

-- Nutritionists can delete any comment on their content
CREATE POLICY "nutritionist_delete_comment"
ON content_comments
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = content_comments.content_id
      AND np.user_id = auth.uid()
  )
);

CREATE INDEX idx_content_comments_content ON content_comments(content_id, created_at);
CREATE INDEX idx_content_comments_parent ON content_comments(parent_id);

-- Add comment_count to educational_contents (denormalized)
ALTER TABLE educational_contents
  ADD COLUMN IF NOT EXISTS comment_count INTEGER NOT NULL DEFAULT 0;

-- Trigger for comment_count
CREATE OR REPLACE FUNCTION update_content_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE educational_contents
    SET comment_count = comment_count + 1
    WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE educational_contents
    SET comment_count = GREATEST(0, comment_count - 1)
    WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_content_comment_count
  AFTER INSERT OR DELETE ON content_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_content_comment_count();

-- Updated_at trigger
CREATE TRIGGER update_content_comments_updated_at
  BEFORE UPDATE ON content_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────
-- 3. CONTENT VERSIONS (CONTENT-N-007)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES educational_contents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  key_points JSONB DEFAULT '[]'::jsonb,
  change_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  UNIQUE (content_id, version_number)
);

ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutritionist_manage_content_versions"
ON content_versions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = content_versions.content_id
      AND np.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = content_versions.content_id
      AND np.user_id = auth.uid()
  )
);

CREATE INDEX idx_content_versions_content ON content_versions(content_id, version_number DESC);

-- Add current_version to educational_contents
ALTER TABLE educational_contents
  ADD COLUMN IF NOT EXISTS current_version INTEGER NOT NULL DEFAULT 0;

-- ─────────────────────────────────────────────────────────────
-- 4. CONTENT ASSIGNMENTS (CONTENT-N-010)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES educational_contents(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  note TEXT CHECK (char_length(note) <= 500),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (content_id, patient_id)
);

ALTER TABLE content_assignments ENABLE ROW LEVEL SECURITY;

-- Nutritionists can manage assignments on their own content
CREATE POLICY "nutritionist_manage_assignments"
ON content_assignments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = content_assignments.content_id
      AND np.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM educational_contents ec
    JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
    WHERE ec.id = content_assignments.content_id
      AND np.user_id = auth.uid()
  )
);

-- Patients can see their own assignments
CREATE POLICY "patient_read_own_assignments"
ON content_assignments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM patient_profiles pp
    WHERE pp.id = content_assignments.patient_id
      AND pp.user_id = auth.uid()
  )
);

CREATE INDEX idx_content_assignments_content ON content_assignments(content_id);
CREATE INDEX idx_content_assignments_patient ON content_assignments(patient_id);
