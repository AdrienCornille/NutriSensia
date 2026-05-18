-- Migration: Contenu educatif - Tables, enums, RLS, storage
-- Date: 2026-03-18
-- Epic 9: CONTENT-N-001 a CONTENT-N-007, RECIPE-N-001/002

-- =============================================================
-- 1. ENUMS
-- =============================================================

DO $$ BEGIN
  CREATE TYPE content_type AS ENUM ('article', 'video', 'guide', 'podcast');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE content_category AS ENUM (
    'nutrition_basics',
    'healthy_recipes',
    'weight_management',
    'sports_nutrition',
    'digestive_health',
    'mental_wellbeing',
    'food_allergies',
    'supplements',
    'meal_planning',
    'lifestyle',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================
-- 2. TABLE: educational_contents
-- =============================================================

CREATE TABLE IF NOT EXISTS educational_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES nutritionist_profiles(id) ON DELETE CASCADE,

  -- Type & category
  type content_type NOT NULL DEFAULT 'article',
  category content_category NOT NULL DEFAULT 'other',
  status content_status NOT NULL DEFAULT 'draft',

  -- Core fields
  title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  slug TEXT NOT NULL,
  summary TEXT CHECK (char_length(summary) <= 500),

  -- Article content (rich text HTML)
  body TEXT,

  -- Media fields (video / guide / podcast)
  media_url TEXT,
  media_type TEXT, -- 'youtube', 'vimeo', 'upload', 'external'
  thumbnail_url TEXT,

  -- Metadata
  reading_time_minutes INTEGER, -- auto-calculated for articles
  duration_seconds INTEGER, -- for video/podcast
  file_size_bytes BIGINT, -- for guide PDF
  page_count INTEGER, -- for guide PDF

  -- Tags (JSON array of strings)
  tags JSONB DEFAULT '[]'::jsonb,

  -- Key points (JSON array of strings for article summary)
  key_points JSONB DEFAULT '[]'::jsonb,

  -- Featured / highlighted
  is_featured BOOLEAN DEFAULT false,
  featured_order INTEGER DEFAULT 0,

  -- Publishing
  published_at TIMESTAMPTZ,
  scheduled_publish_at TIMESTAMPTZ,

  -- Stats (denormalized for performance)
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Unique slug per nutritionist
  CONSTRAINT unique_content_slug UNIQUE (nutritionist_id, slug)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_educational_contents_nutritionist ON educational_contents(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_educational_contents_status ON educational_contents(status);
CREATE INDEX IF NOT EXISTS idx_educational_contents_type ON educational_contents(type);
CREATE INDEX IF NOT EXISTS idx_educational_contents_category ON educational_contents(category);
CREATE INDEX IF NOT EXISTS idx_educational_contents_published ON educational_contents(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_educational_contents_featured ON educational_contents(featured_order) WHERE is_featured = true;

-- Updated_at trigger
CREATE OR REPLACE TRIGGER update_educational_contents_updated_at
  BEFORE UPDATE ON educational_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- 3. TABLE: content_views (track patient views)
-- =============================================================

CREATE TABLE IF NOT EXISTS content_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES educational_contents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  view_date DATE NOT NULL DEFAULT CURRENT_DATE,
  viewed_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_daily_view UNIQUE (content_id, user_id, view_date)
);

CREATE INDEX IF NOT EXISTS idx_content_views_content ON content_views(content_id);
CREATE INDEX IF NOT EXISTS idx_content_views_user ON content_views(user_id);

-- =============================================================
-- 4. TABLE: content_saves (patient bookmarks)
-- =============================================================

CREATE TABLE IF NOT EXISTS content_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES educational_contents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_content_save UNIQUE (content_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_content_saves_user ON content_saves(user_id);

-- =============================================================
-- 5. RLS POLICIES
-- =============================================================

ALTER TABLE educational_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_saves ENABLE ROW LEVEL SECURITY;

-- Nutritionist: full CRUD on own content
CREATE POLICY "nutritionist_manage_content" ON educational_contents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM nutritionist_profiles np
      WHERE np.id = educational_contents.nutritionist_id
        AND np.user_id = auth.uid()
    )
  );

-- Patient: read published content from their nutritionist
CREATE POLICY "patient_read_published_content" ON educational_contents
  FOR SELECT USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM patient_profiles pp
      WHERE pp.user_id = auth.uid()
        AND pp.nutritionist_id = educational_contents.nutritionist_id
    )
  );

-- Content views: users can insert their own views
CREATE POLICY "user_insert_own_view" ON content_views
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Content views: nutritionists can read views on their content
CREATE POLICY "nutritionist_read_content_views" ON content_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM educational_contents ec
      JOIN nutritionist_profiles np ON np.id = ec.nutritionist_id
      WHERE ec.id = content_views.content_id
        AND np.user_id = auth.uid()
    )
  );

-- Content saves: users manage their own saves
CREATE POLICY "user_manage_own_saves" ON content_saves
  FOR ALL USING (user_id = auth.uid());

-- =============================================================
-- 6. HELPER FUNCTIONS
-- =============================================================

-- Auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_content_slug(p_title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        translate(p_title, 'àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ', 'aaaeeeeiioouuycaaaeeeeiioouuyc'),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Increment view count (called after inserting a content_view)
CREATE OR REPLACE FUNCTION increment_content_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE educational_contents
  SET view_count = view_count + 1
  WHERE id = NEW.content_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_increment_view_count
  AFTER INSERT ON content_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_view_count();

-- Update save_count on insert/delete
CREATE OR REPLACE FUNCTION update_content_save_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE educational_contents SET save_count = save_count + 1 WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE educational_contents SET save_count = save_count - 1 WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_update_save_count
  AFTER INSERT OR DELETE ON content_saves
  FOR EACH ROW
  EXECUTE FUNCTION update_content_save_count();

-- =============================================================
-- Verification
-- =============================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration create_educational_content terminee avec succes';
END $$;
