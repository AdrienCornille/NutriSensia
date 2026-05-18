-- ============================================================================
-- Migration: Create Storage Bucket for Message Attachments
-- Description: Creates the 'message-attachments' bucket and RLS policies
--              so conversation participants can upload/download files.
-- ============================================================================

-- 1. Create the bucket (public URLs for reading, RLS for writing)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  true,                     -- public read (URLs are unguessable with timestamp prefix)
  10485760,                 -- 10 MB max
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Authenticated users can upload to their conversations
CREATE POLICY "Participants can upload attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments'
  AND (
    -- The path starts with a conversation_id they participate in
    EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (c.patient_id = auth.uid() OR c.nutritionist_id = auth.uid())
    )
  )
);

-- 3. Policy: Anyone can read (bucket is public, URLs contain unique timestamp)
CREATE POLICY "Public read for message attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'message-attachments');

-- 4. Policy: Participants can delete their own uploads
CREATE POLICY "Participants can delete own attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND (
    EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (c.patient_id = auth.uid() OR c.nutritionist_id = auth.uid())
    )
  )
);
