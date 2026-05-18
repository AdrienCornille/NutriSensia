-- Migration: Add full-text search to messages
-- Uses PostgreSQL tsvector with French text search configuration

-- 1. Add generated tsvector column for full-text search
ALTER TABLE messages ADD COLUMN IF NOT EXISTS content_tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('french', coalesce(content, ''))) STORED;

-- 2. Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_messages_content_fts
  ON messages USING GIN(content_tsv);

-- 3. Index on content for ILIKE fallback (short queries)
CREATE INDEX IF NOT EXISTS idx_messages_content_trgm
  ON messages USING GIN(content gin_trgm_ops);

-- Note: requires pg_trgm extension (already enabled in most Supabase instances)
-- If not, run: CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 4. Search function: returns messages matching a query for a given user
--    Uses prefix tsquery (:*) so partial words match (e.g. "bonjou" → "bonjour")
--    Falls back to ILIKE for very short queries (< 3 chars) or when FTS returns nothing
CREATE OR REPLACE FUNCTION search_messages(
  p_user_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_conversation_id UUID DEFAULT NULL
)
RETURNS TABLE (
  message_id UUID,
  conversation_id UUID,
  content TEXT,
  highlighted_content TEXT,
  created_at TIMESTAMPTZ,
  sender_name TEXT,
  other_user_name TEXT
) AS $$
DECLARE
  v_tsquery tsquery;
  v_prefix_query TEXT;
  v_result_count INTEGER;
BEGIN
  -- Build a prefix tsquery: "bonjou" → "bonjou:*", "bon jour" → "bon:* & jour:*"
  SELECT string_agg(lexeme || ':*', ' & ')
  INTO v_prefix_query
  FROM unnest(string_to_array(trim(p_query), ' ')) AS lexeme
  WHERE length(lexeme) > 0;

  BEGIN
    v_tsquery := to_tsquery('french', v_prefix_query);
  EXCEPTION WHEN OTHERS THEN
    -- If tsquery parsing fails, fall through to ILIKE
    v_tsquery := NULL;
  END;

  -- Try FTS first
  IF v_tsquery IS NOT NULL THEN
    RETURN QUERY
    SELECT
      m.id AS message_id,
      m.conversation_id,
      m.content,
      ts_headline('french', m.content, v_tsquery,
        'StartSel=<mark>, StopSel=</mark>, MaxFragments=2, FragmentDelimiter= ... '
      ) AS highlighted_content,
      m.created_at,
      COALESCE(sender_p.first_name || ' ' || sender_p.last_name, 'Inconnu') AS sender_name,
      COALESCE(other_p.first_name || ' ' || other_p.last_name, 'Inconnu') AS other_user_name
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    LEFT JOIN profiles sender_p ON sender_p.id = m.sender_id
    LEFT JOIN profiles other_p ON other_p.id = CASE
      WHEN c.patient_id = p_user_id THEN c.nutritionist_id
      ELSE c.patient_id
    END
    WHERE (c.patient_id = p_user_id OR c.nutritionist_id = p_user_id)
      AND (p_conversation_id IS NULL OR m.conversation_id = p_conversation_id)
      AND m.deleted_at IS NULL
      AND m.content_tsv @@ v_tsquery
    ORDER BY m.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;

    -- Check if we got results
    GET DIAGNOSTICS v_result_count = ROW_COUNT;
    IF v_result_count > 0 THEN
      RETURN;
    END IF;
  END IF;

  -- Fallback: ILIKE for partial/prefix matches when FTS returns nothing
  RETURN QUERY
  SELECT
    m.id AS message_id,
    m.conversation_id,
    m.content,
    regexp_replace(
      m.content,
      '(' || regexp_replace(p_query, '([.*+?^${}()|[\]\\])', '\\\1', 'g') || ')',
      '<mark>\1</mark>',
      'gi'
    ) AS highlighted_content,
    m.created_at,
    COALESCE(sender_p.first_name || ' ' || sender_p.last_name, 'Inconnu') AS sender_name,
    COALESCE(other_p.first_name || ' ' || other_p.last_name, 'Inconnu') AS other_user_name
  FROM messages m
  JOIN conversations c ON c.id = m.conversation_id
  LEFT JOIN profiles sender_p ON sender_p.id = m.sender_id
  LEFT JOIN profiles other_p ON other_p.id = CASE
    WHEN c.patient_id = p_user_id THEN c.nutritionist_id
    ELSE c.patient_id
  END
  WHERE (c.patient_id = p_user_id OR c.nutritionist_id = p_user_id)
    AND (p_conversation_id IS NULL OR m.conversation_id = p_conversation_id)
    AND m.deleted_at IS NULL
    AND m.content ILIKE '%' || p_query || '%'
  ORDER BY m.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 5. Count function for pagination
CREATE OR REPLACE FUNCTION search_messages_count(
  p_user_id UUID,
  p_query TEXT,
  p_conversation_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
  v_tsquery tsquery;
  v_prefix_query TEXT;
BEGIN
  -- Build prefix tsquery
  SELECT string_agg(lexeme || ':*', ' & ')
  INTO v_prefix_query
  FROM unnest(string_to_array(trim(p_query), ' ')) AS lexeme
  WHERE length(lexeme) > 0;

  BEGIN
    v_tsquery := to_tsquery('french', v_prefix_query);
  EXCEPTION WHEN OTHERS THEN
    v_tsquery := NULL;
  END;

  -- Try FTS count first
  IF v_tsquery IS NOT NULL THEN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE (c.patient_id = p_user_id OR c.nutritionist_id = p_user_id)
      AND (p_conversation_id IS NULL OR m.conversation_id = p_conversation_id)
      AND m.deleted_at IS NULL
      AND m.content_tsv @@ v_tsquery;

    IF v_count > 0 THEN
      RETURN v_count;
    END IF;
  END IF;

  -- Fallback ILIKE count
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM messages m
  JOIN conversations c ON c.id = m.conversation_id
  WHERE (c.patient_id = p_user_id OR c.nutritionist_id = p_user_id)
    AND (p_conversation_id IS NULL OR m.conversation_id = p_conversation_id)
    AND m.deleted_at IS NULL
    AND m.content ILIKE '%' || p_query || '%';

  RETURN v_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
