-- ============================================================================
-- Migration: Create Storage Bucket for Content Files (PDFs)
-- Description: Creates the 'content-files' bucket and RLS policies
--              so nutritionists can upload PDF guides.
-- ============================================================================

-- 1. Create the bucket (not public - download via signed URL or API)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-files',
  'content-files',
  false,                    -- private (download controlled by API)
  20971520,                 -- 20 MB max
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Nutritionists can upload files
CREATE POLICY "Nutritionists can upload content files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-files'
  AND EXISTS (
    SELECT 1
    FROM nutritionist_profiles np
    WHERE np.user_id = auth.uid()
      AND np.id::text = (storage.foldername(name))[1]
  )
);

-- 3. Policy: Authenticated users can read (patients download their nutritionist's files)
CREATE POLICY "Authenticated read for content files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'content-files');

-- 4. Policy: Nutritionists can delete their own files
CREATE POLICY "Nutritionists can delete content files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-files'
  AND EXISTS (
    SELECT 1
    FROM nutritionist_profiles np
    WHERE np.user_id = auth.uid()
      AND np.id::text = (storage.foldername(name))[1]
  )
);
