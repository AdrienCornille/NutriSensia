-- ============================================================================
-- Migration: Create Storage Bucket for Content Thumbnails
-- Description: Creates the 'content-thumbnails' bucket and RLS policies
--              so nutritionists can upload thumbnails for educational content.
-- ============================================================================

-- 1. Create the bucket (public read for patient access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-thumbnails',
  'content-thumbnails',
  true,                     -- public read (patients need to see thumbnails)
  5242880,                  -- 5 MB max
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Nutritionists can upload thumbnails for their own content
CREATE POLICY "Nutritionists can upload content thumbnails"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-thumbnails'
  AND EXISTS (
    SELECT 1
    FROM nutritionist_profiles np
    WHERE np.user_id = auth.uid()
      AND np.id::text = (storage.foldername(name))[1]
  )
);

-- 3. Policy: Public read (thumbnails are visible to patients)
CREATE POLICY "Public read for content thumbnails"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'content-thumbnails');

-- 4. Policy: Nutritionists can update/replace their own thumbnails
CREATE POLICY "Nutritionists can update content thumbnails"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-thumbnails'
  AND EXISTS (
    SELECT 1
    FROM nutritionist_profiles np
    WHERE np.user_id = auth.uid()
      AND np.id::text = (storage.foldername(name))[1]
  )
);

-- 5. Policy: Nutritionists can delete their own thumbnails
CREATE POLICY "Nutritionists can delete content thumbnails"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-thumbnails'
  AND EXISTS (
    SELECT 1
    FROM nutritionist_profiles np
    WHERE np.user_id = auth.uid()
      AND np.id::text = (storage.foldername(name))[1]
  )
);
