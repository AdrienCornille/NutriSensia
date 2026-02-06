-- ============================================================================
-- NutriSensia Database Schema - 07 Messaging
-- ============================================================================
-- Phase 5: Messagerie
-- Dépendances: 01_extensions_and_types.sql, 02_patient_nutritionist.sql
-- User Stories: MSG-001 à MSG-010
-- ============================================================================

-- ============================================================================
-- TABLE: conversations
-- Description: Conversations entre patient et nutritionniste
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Participants
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    nutritionist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Statut
    is_active BOOLEAN DEFAULT true,

    -- Dernière activité
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,

    -- Compteurs non-lus (pour chaque participant)
    patient_unread_count INTEGER DEFAULT 0,
    nutritionist_unread_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte d'unicité (une seule conversation par paire patient-nutritionniste)
    UNIQUE(patient_id, nutritionist_id)
);

-- Trigger pour updated_at
CREATE TRIGGER conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_conversations_patient ON conversations(patient_id);
CREATE INDEX idx_conversations_nutritionist ON conversations(nutritionist_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_active ON conversations(is_active) WHERE is_active = true;

-- ============================================================================
-- TABLE: messages
-- Description: Messages individuels dans les conversations
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaison
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    -- Expéditeur
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Contenu
    content TEXT,
    message_type message_type DEFAULT 'text',

    -- Pour les modifications de plan alimentaire
    plan_modification JSONB, -- { field, oldValue, newValue }

    -- Statut
    status message_status DEFAULT 'sent',

    -- Lecture
    read_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ -- Soft delete pour messages supprimés
);

-- Trigger pour updated_at
CREATE TRIGGER messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_unread ON messages(conversation_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_messages_type ON messages(message_type);

-- ============================================================================
-- TABLE: message_attachments
-- Description: Pièces jointes des messages
-- ============================================================================

CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaison
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,

    -- Fichier
    file_type attachment_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER, -- Taille en bytes
    mime_type VARCHAR(100),

    -- Thumbnail pour images
    thumbnail_url TEXT,

    -- Dimensions pour images
    width INTEGER,
    height INTEGER,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_message_attachments_message ON message_attachments(message_id);
CREATE INDEX idx_message_attachments_type ON message_attachments(file_type);

-- ============================================================================
-- TABLE: quick_replies
-- Description: Réponses rapides prédéfinies
-- ============================================================================

CREATE TABLE IF NOT EXISTS quick_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Propriétaire (NULL = réponse système pour tous)
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

    -- Contenu
    text VARCHAR(200) NOT NULL,
    category VARCHAR(30) DEFAULT 'general', -- 'greeting', 'question', 'confirmation', 'general'

    -- Affichage
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER quick_replies_updated_at
    BEFORE UPDATE ON quick_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_quick_replies_user ON quick_replies(user_id);
CREATE INDEX idx_quick_replies_category ON quick_replies(category);
CREATE INDEX idx_quick_replies_active ON quick_replies(is_active) WHERE is_active = true;

-- Données initiales - Réponses rapides système
INSERT INTO quick_replies (user_id, text, category, display_order) VALUES
    (NULL, 'Bonjour !', 'greeting', 1),
    (NULL, 'Merci beaucoup', 'confirmation', 2),
    (NULL, 'J''ai une question', 'question', 3),
    (NULL, 'D''accord, je comprends', 'confirmation', 4),
    (NULL, 'Pouvez-vous m''expliquer ?', 'question', 5),
    (NULL, 'À bientôt !', 'greeting', 6)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TABLE: message_read_receipts
-- Description: Accusés de lecture des messages
-- ============================================================================

CREATE TABLE IF NOT EXISTS message_read_receipts (
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (message_id, user_id)
);

-- Index
CREATE INDEX idx_message_read_receipts_user ON message_read_receipts(user_id, read_at DESC);

-- ============================================================================
-- TABLE: typing_indicators
-- Description: Indicateurs de saisie en temps réel
-- Note: Cette table est utilisée avec Supabase Realtime
-- ============================================================================

CREATE TABLE IF NOT EXISTS typing_indicators (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (conversation_id, user_id)
);

-- Index
CREATE INDEX idx_typing_indicators_conversation ON typing_indicators(conversation_id);

-- ============================================================================
-- TABLE: conversation_settings
-- Description: Paramètres de conversation par utilisateur
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversation_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaisons
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Paramètres
    is_muted BOOLEAN DEFAULT false,
    mute_until TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,

    -- Notifications
    notify_on_message BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte d'unicité
    UNIQUE(conversation_id, user_id)
);

-- Trigger pour updated_at
CREATE TRIGGER conversation_settings_updated_at
    BEFORE UPDATE ON conversation_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_conversation_settings_user ON conversation_settings(user_id);
CREATE INDEX idx_conversation_settings_conversation ON conversation_settings(conversation_id);
CREATE INDEX idx_conversation_settings_archived ON conversation_settings(user_id, is_archived) WHERE is_archived = true;
CREATE INDEX idx_conversation_settings_pinned ON conversation_settings(user_id, is_pinned) WHERE is_pinned = true;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Fonction pour mettre à jour last_message_at et preview
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100),
        updated_at = now(),
        -- Incrémenter le compteur non-lu pour le destinataire
        patient_unread_count = CASE
            WHEN (SELECT role FROM profiles WHERE id = NEW.sender_id) = 'nutritionist'
            THEN patient_unread_count + 1
            ELSE patient_unread_count
        END,
        nutritionist_unread_count = CASE
            WHEN (SELECT role FROM profiles WHERE id = NEW.sender_id) = 'patient'
            THEN nutritionist_unread_count + 1
            ELSE nutritionist_unread_count
        END
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour la conversation
CREATE TRIGGER messages_update_conversation
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Fonction pour marquer les messages comme lus
CREATE OR REPLACE FUNCTION mark_messages_as_read(
    p_conversation_id UUID,
    p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
    v_user_role user_role;
BEGIN
    -- Récupérer le rôle de l'utilisateur
    SELECT role INTO v_user_role FROM profiles WHERE id = p_user_id;

    -- Marquer les messages comme lus
    UPDATE messages
    SET
        read_at = now(),
        status = 'read',
        updated_at = now()
    WHERE conversation_id = p_conversation_id
        AND sender_id != p_user_id
        AND read_at IS NULL;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    -- Insérer les accusés de lecture
    INSERT INTO message_read_receipts (message_id, user_id)
    SELECT id, p_user_id
    FROM messages
    WHERE conversation_id = p_conversation_id
        AND sender_id != p_user_id
    ON CONFLICT DO NOTHING;

    -- Réinitialiser le compteur non-lu
    IF v_user_role = 'patient' THEN
        UPDATE conversations
        SET patient_unread_count = 0, updated_at = now()
        WHERE id = p_conversation_id;
    ELSIF v_user_role = 'nutritionist' THEN
        UPDATE conversations
        SET nutritionist_unread_count = 0, updated_at = now()
        WHERE id = p_conversation_id;
    END IF;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir ou créer une conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    p_patient_id UUID,
    p_nutritionist_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
BEGIN
    -- Chercher une conversation existante
    SELECT id INTO v_conversation_id
    FROM conversations
    WHERE patient_id = p_patient_id
        AND nutritionist_id = p_nutritionist_id;

    -- Si pas trouvée, en créer une nouvelle
    IF v_conversation_id IS NULL THEN
        INSERT INTO conversations (patient_id, nutritionist_id)
        VALUES (p_patient_id, p_nutritionist_id)
        RETURNING id INTO v_conversation_id;

        -- Créer les paramètres par défaut pour chaque participant
        INSERT INTO conversation_settings (conversation_id, user_id)
        VALUES
            (v_conversation_id, p_patient_id),
            (v_conversation_id, p_nutritionist_id);
    END IF;

    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour envoyer un message
CREATE OR REPLACE FUNCTION send_message(
    p_conversation_id UUID,
    p_sender_id UUID,
    p_content TEXT,
    p_message_type message_type DEFAULT 'text',
    p_plan_modification JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_message_id UUID;
BEGIN
    -- Vérifier que l'expéditeur fait partie de la conversation
    IF NOT EXISTS (
        SELECT 1 FROM conversations
        WHERE id = p_conversation_id
        AND (patient_id = p_sender_id OR nutritionist_id = p_sender_id)
    ) THEN
        RAISE EXCEPTION 'User is not part of this conversation';
    END IF;

    -- Insérer le message
    INSERT INTO messages (
        conversation_id,
        sender_id,
        content,
        message_type,
        plan_modification,
        status
    ) VALUES (
        p_conversation_id,
        p_sender_id,
        p_content,
        p_message_type,
        p_plan_modification,
        'sent'
    )
    RETURNING id INTO v_message_id;

    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les conversations d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_conversations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    conversation_id UUID,
    other_user_id UUID,
    other_user_name VARCHAR(100),
    other_user_avatar TEXT,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    unread_count INTEGER,
    is_muted BOOLEAN,
    is_pinned BOOLEAN
) AS $$
DECLARE
    v_user_role user_role;
BEGIN
    SELECT role INTO v_user_role FROM profiles WHERE id = p_user_id;

    RETURN QUERY
    SELECT
        c.id AS conversation_id,
        CASE
            WHEN v_user_role = 'patient' THEN c.nutritionist_id
            ELSE c.patient_id
        END AS other_user_id,
        p.full_name AS other_user_name,
        p.avatar_url AS other_user_avatar,
        c.last_message_preview AS last_message,
        c.last_message_at,
        CASE
            WHEN v_user_role = 'patient' THEN c.patient_unread_count
            ELSE c.nutritionist_unread_count
        END AS unread_count,
        COALESCE(cs.is_muted, false) AS is_muted,
        COALESCE(cs.is_pinned, false) AS is_pinned
    FROM conversations c
    JOIN profiles p ON p.id = CASE
        WHEN v_user_role = 'patient' THEN c.nutritionist_id
        ELSE c.patient_id
    END
    LEFT JOIN conversation_settings cs ON cs.conversation_id = c.id AND cs.user_id = p_user_id
    WHERE c.is_active = true
        AND (
            (v_user_role = 'patient' AND c.patient_id = p_user_id)
            OR (v_user_role = 'nutritionist' AND c.nutritionist_id = p_user_id)
            OR (v_user_role = 'admin')
        )
        AND COALESCE(cs.is_archived, false) = false
    ORDER BY
        COALESCE(cs.is_pinned, false) DESC,
        c.last_message_at DESC NULLS LAST
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir l'historique des messages
CREATE OR REPLACE FUNCTION get_conversation_messages(
    p_conversation_id UUID,
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_before_id UUID DEFAULT NULL
)
RETURNS TABLE (
    message_id UUID,
    sender_id UUID,
    sender_name VARCHAR(100),
    content TEXT,
    message_type message_type,
    status message_status,
    plan_modification JSONB,
    attachments JSONB,
    created_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    is_from_user BOOLEAN
) AS $$
BEGIN
    -- Vérifier que l'utilisateur fait partie de la conversation
    IF NOT EXISTS (
        SELECT 1 FROM conversations
        WHERE id = p_conversation_id
        AND (patient_id = p_user_id OR nutritionist_id = p_user_id)
    ) AND NOT EXISTS (
        SELECT 1 FROM profiles WHERE id = p_user_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'User is not part of this conversation';
    END IF;

    RETURN QUERY
    SELECT
        m.id AS message_id,
        m.sender_id,
        p.full_name AS sender_name,
        m.content,
        m.message_type,
        m.status,
        m.plan_modification,
        COALESCE(
            (SELECT jsonb_agg(jsonb_build_object(
                'id', ma.id,
                'type', ma.file_type,
                'name', ma.file_name,
                'url', ma.file_url,
                'size', ma.file_size,
                'thumbnailUrl', ma.thumbnail_url
            ))
            FROM message_attachments ma
            WHERE ma.message_id = m.id),
            '[]'::JSONB
        ) AS attachments,
        m.created_at,
        m.read_at,
        (m.sender_id = p_user_id) AS is_from_user
    FROM messages m
    JOIN profiles p ON p.id = m.sender_id
    WHERE m.conversation_id = p_conversation_id
        AND m.deleted_at IS NULL
        AND (p_before_id IS NULL OR m.created_at < (SELECT created_at FROM messages WHERE id = p_before_id))
    ORDER BY m.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_settings ENABLE ROW LEVEL SECURITY;

-- Politiques pour conversations
DROP POLICY IF EXISTS conversations_participant ON conversations;
CREATE POLICY conversations_participant ON conversations
    FOR ALL USING (
        patient_id = auth.uid()
        OR nutritionist_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour messages
DROP POLICY IF EXISTS messages_participant ON messages;
CREATE POLICY messages_participant ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.patient_id = auth.uid() OR c.nutritionist_id = auth.uid())
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS messages_sender ON messages;
CREATE POLICY messages_sender ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.patient_id = auth.uid() OR c.nutritionist_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS messages_update_own ON messages;
CREATE POLICY messages_update_own ON messages
    FOR UPDATE USING (sender_id = auth.uid());

DROP POLICY IF EXISTS messages_delete_own ON messages;
CREATE POLICY messages_delete_own ON messages
    FOR DELETE USING (sender_id = auth.uid());

-- Politiques pour message_attachments
DROP POLICY IF EXISTS message_attachments_via_message ON message_attachments;
CREATE POLICY message_attachments_via_message ON message_attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE m.id = message_attachments.message_id
            AND (c.patient_id = auth.uid() OR c.nutritionist_id = auth.uid())
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour quick_replies
DROP POLICY IF EXISTS quick_replies_own_or_system ON quick_replies;
CREATE POLICY quick_replies_own_or_system ON quick_replies
    FOR SELECT USING (
        user_id IS NULL -- Réponses système
        OR user_id = auth.uid()
    );

DROP POLICY IF EXISTS quick_replies_manage_own ON quick_replies;
CREATE POLICY quick_replies_manage_own ON quick_replies
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour message_read_receipts
DROP POLICY IF EXISTS message_read_receipts_own ON message_read_receipts;
CREATE POLICY message_read_receipts_own ON message_read_receipts
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour typing_indicators
DROP POLICY IF EXISTS typing_indicators_participant ON typing_indicators;
CREATE POLICY typing_indicators_participant ON typing_indicators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = typing_indicators.conversation_id
            AND (c.patient_id = auth.uid() OR c.nutritionist_id = auth.uid())
        )
    );

-- Politiques pour conversation_settings
DROP POLICY IF EXISTS conversation_settings_own ON conversation_settings;
CREATE POLICY conversation_settings_own ON conversation_settings
    FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Activer Realtime pour les tables nécessaires
-- Note: À configurer dans le dashboard Supabase
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;
-- ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE conversations IS 'Conversations entre patient et nutritionniste';
COMMENT ON TABLE messages IS 'Messages individuels dans les conversations';
COMMENT ON TABLE message_attachments IS 'Pièces jointes des messages (images, documents)';
COMMENT ON TABLE quick_replies IS 'Réponses rapides prédéfinies (système ou personnalisées)';
COMMENT ON TABLE message_read_receipts IS 'Accusés de lecture des messages';
COMMENT ON TABLE typing_indicators IS 'Indicateurs de saisie en temps réel pour Supabase Realtime';
COMMENT ON TABLE conversation_settings IS 'Paramètres de conversation par utilisateur (mute, archive, etc.)';

COMMENT ON FUNCTION mark_messages_as_read IS 'Marque tous les messages non lus d''une conversation comme lus';
COMMENT ON FUNCTION get_or_create_conversation IS 'Obtient ou crée une conversation entre patient et nutritionniste';
COMMENT ON FUNCTION send_message IS 'Envoie un message dans une conversation';
COMMENT ON FUNCTION get_user_conversations IS 'Récupère la liste des conversations d''un utilisateur';
COMMENT ON FUNCTION get_conversation_messages IS 'Récupère l''historique des messages d''une conversation';
