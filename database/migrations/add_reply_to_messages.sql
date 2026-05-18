-- Migration: Ajouter le support des réponses/citations de messages
-- Date: 2026-03-16

-- 1. Ajouter la colonne reply_to_id sur la table messages
ALTER TABLE messages ADD COLUMN reply_to_id UUID DEFAULT NULL REFERENCES messages(id) ON DELETE SET NULL;

-- 2. Index pour les lookups de réponses
CREATE INDEX idx_messages_reply_to_id ON messages(reply_to_id) WHERE reply_to_id IS NOT NULL;

-- Vérification
DO $$
BEGIN
  RAISE NOTICE 'Migration add_reply_to_messages terminée avec succès';
END $$;
