-- Migration: Add nutritionist presence tracking
-- Tracks last_seen_at and average response time for online status display

-- 1. Add presence columns to nutritionist_profiles
ALTER TABLE nutritionist_profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS avg_response_time_minutes INTEGER;

-- 2. Index for efficient presence queries
CREATE INDEX IF NOT EXISTS idx_nutritionist_profiles_last_seen
  ON nutritionist_profiles(last_seen_at) WHERE last_seen_at IS NOT NULL;

-- 3. Function to compute average response time for a nutritionist
-- Calculates from the last 50 conversations: avg time between patient message and nutritionist reply
CREATE OR REPLACE FUNCTION compute_avg_response_time(p_nutritionist_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_avg_minutes INTEGER;
BEGIN
  WITH response_pairs AS (
    SELECT
      m_patient.created_at AS patient_msg_at,
      MIN(m_nutri.created_at) AS nutri_reply_at
    FROM messages m_patient
    JOIN conversations c ON c.id = m_patient.conversation_id
    JOIN messages m_nutri ON m_nutri.conversation_id = m_patient.conversation_id
      AND m_nutri.sender_id = c.nutritionist_id
      AND m_nutri.created_at > m_patient.created_at
    WHERE c.nutritionist_id = p_nutritionist_user_id
      AND m_patient.sender_id = c.patient_id
      AND m_patient.message_type = 'text'
      AND m_patient.deleted_at IS NULL
      AND m_nutri.deleted_at IS NULL
      AND m_patient.created_at > now() - INTERVAL '30 days'
    GROUP BY m_patient.id, m_patient.created_at
    ORDER BY m_patient.created_at DESC
    LIMIT 50
  )
  SELECT ROUND(AVG(EXTRACT(EPOCH FROM (nutri_reply_at - patient_msg_at)) / 60))::INTEGER
  INTO v_avg_minutes
  FROM response_pairs;

  RETURN COALESCE(v_avg_minutes, NULL);
END;
$$ LANGUAGE plpgsql STABLE;
