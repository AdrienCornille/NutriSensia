-- ============================================================================
-- Migration: Add 'scheduled' status to content_status enum
-- Description: Supports scheduled publication workflow (CONTENT-N-006)
-- ============================================================================

-- Add 'scheduled' value to the content_status enum
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'scheduled' AFTER 'draft';

-- Update scheduled content handler: when scheduled_publish_at is in the past,
-- automatically publish. This can be called by a cron job or Edge Function.
CREATE OR REPLACE FUNCTION publish_scheduled_content()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  published_count INTEGER;
BEGIN
  UPDATE educational_contents
  SET status = 'published',
      published_at = NOW(),
      scheduled_publish_at = NULL,
      updated_at = NOW()
  WHERE status = 'scheduled'
    AND scheduled_publish_at IS NOT NULL
    AND scheduled_publish_at <= NOW();

  GET DIAGNOSTICS published_count = ROW_COUNT;
  RETURN published_count;
END;
$$;
