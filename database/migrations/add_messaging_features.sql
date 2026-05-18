-- ============================================================================
-- Migration: Messaging features (typing indicators, reactions, edit/delete)
-- ============================================================================

-- 1. Table message_reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('👍', '❤️', '😂', '😮', '😢', '🙏')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

-- Index for fast lookup by message
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);

-- 2. Add edited_at column to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ DEFAULT NULL;

-- 3. RLS policies for message_reactions
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- SELECT: user must be a participant of the conversation that owns the message
CREATE POLICY "message_reactions_select" ON message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND (c.patient_id = auth.uid() OR c.nutritionist_id = auth.uid())
    )
  );

-- INSERT: user can only add reactions as themselves, and must be a participant
CREATE POLICY "message_reactions_insert" ON message_reactions
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_reactions.message_id
        AND (c.patient_id = auth.uid() OR c.nutritionist_id = auth.uid())
    )
  );

-- DELETE: user can only remove their own reactions
CREATE POLICY "message_reactions_delete" ON message_reactions
  FOR DELETE USING (user_id = auth.uid());

-- 4. Add tables to Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;

-- 5. Enable replica identity for Realtime (needed for UPDATE/DELETE events)
ALTER TABLE typing_indicators REPLICA IDENTITY FULL;
ALTER TABLE message_reactions REPLICA IDENTITY FULL;
