-- ============================================================================
-- Migration: Custom Content Categories (CONTENT-N-008)
-- Description: Allows nutritionists to create their own content categories
-- ============================================================================

CREATE TABLE IF NOT EXISTS custom_content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES nutritionist_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  color TEXT DEFAULT NULL CHECK (color IS NULL OR color ~ '^#[0-9a-fA-F]{6}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (nutritionist_id, name)
);

-- RLS
ALTER TABLE custom_content_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritionists manage own categories"
ON custom_content_categories
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM nutritionist_profiles np
    WHERE np.id = custom_content_categories.nutritionist_id
      AND np.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM nutritionist_profiles np
    WHERE np.id = custom_content_categories.nutritionist_id
      AND np.user_id = auth.uid()
  )
);

-- Index
CREATE INDEX idx_custom_categories_nutritionist ON custom_content_categories(nutritionist_id);

-- Updated_at trigger
CREATE TRIGGER update_custom_content_categories_updated_at
  BEFORE UPDATE ON custom_content_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add custom_category_id to educational_contents (nullable, for custom categories)
ALTER TABLE educational_contents
  ADD COLUMN IF NOT EXISTS custom_category_id UUID REFERENCES custom_content_categories(id) ON DELETE SET NULL;
