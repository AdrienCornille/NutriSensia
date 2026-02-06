-- ============================================================================
-- NutriSensia Database Schema - 14 Notifications
-- ============================================================================
-- Phase 12: Notifications
-- Dépendances: 01_extensions_and_types.sql, 02_patient_nutritionist.sql
-- User Stories: NOTIF-001 à NOTIF-006, MSG-007
-- ============================================================================

-- ============================================================================
-- TABLE: notification_types
-- Description: Types de notifications système
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    code VARCHAR(50) NOT NULL UNIQUE,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),

    -- Catégorie
    category notification_category NOT NULL, -- 'appointment', 'message', 'plan', 'biometric', 'content', 'system'

    -- Template
    title_template_fr VARCHAR(200) NOT NULL,
    title_template_en VARCHAR(200),
    body_template_fr TEXT NOT NULL,
    body_template_en TEXT,

    -- Affichage
    icon VARCHAR(50),
    color VARCHAR(20),

    -- Comportement
    priority notification_priority DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    default_channels TEXT[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'push', 'sms'

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_notification_types_code ON notification_types(code);
CREATE INDEX idx_notification_types_category ON notification_types(category);

-- Données initiales - Types de notifications
INSERT INTO notification_types (code, name_fr, category, title_template_fr, body_template_fr, icon, priority, default_channels) VALUES
    -- Rendez-vous
    ('appointment_reminder_24h', 'Rappel RDV 24h', 'appointment', 'Rappel: RDV demain', 'Vous avez un rendez-vous demain à {{time}} avec {{nutritionist}}', '🗓️', 'high', ARRAY['in_app', 'email', 'push']),
    ('appointment_reminder_1h', 'Rappel RDV 1h', 'appointment', 'RDV dans 1 heure', 'Votre rendez-vous avec {{nutritionist}} commence dans 1 heure', '⏰', 'urgent', ARRAY['in_app', 'push']),
    ('appointment_confirmed', 'RDV confirmé', 'appointment', 'RDV confirmé', 'Votre rendez-vous du {{date}} à {{time}} est confirmé', '✅', 'normal', ARRAY['in_app', 'email']),
    ('appointment_cancelled', 'RDV annulé', 'appointment', 'RDV annulé', 'Votre rendez-vous du {{date}} a été annulé', '❌', 'high', ARRAY['in_app', 'email', 'push']),
    ('appointment_rescheduled', 'RDV reporté', 'appointment', 'RDV reporté', 'Votre rendez-vous a été reporté au {{new_date}} à {{new_time}}', '📅', 'high', ARRAY['in_app', 'email']),

    -- Messages
    ('new_message', 'Nouveau message', 'message', 'Nouveau message', '{{sender}} vous a envoyé un message', '💬', 'normal', ARRAY['in_app', 'push']),
    ('unread_messages', 'Messages non lus', 'message', 'Messages non lus', 'Vous avez {{count}} messages non lus', '📬', 'low', ARRAY['in_app']),

    -- Plan alimentaire
    ('new_meal_plan', 'Nouveau plan', 'plan', 'Nouveau plan alimentaire', 'Votre nutritionniste vous a créé un nouveau plan alimentaire', '🍽️', 'high', ARRAY['in_app', 'email', 'push']),
    ('plan_modification_approved', 'Modification approuvée', 'plan', 'Modification approuvée', 'Votre demande de modification a été approuvée', '✅', 'normal', ARRAY['in_app']),
    ('plan_modification_rejected', 'Modification refusée', 'plan', 'Modification refusée', 'Votre demande de modification a été refusée', '❌', 'normal', ARRAY['in_app']),

    -- Biométrique
    ('weight_goal_reached', 'Objectif poids atteint', 'biometric', 'Objectif atteint! 🎉', 'Félicitations! Vous avez atteint votre objectif de poids', '🏆', 'high', ARRAY['in_app', 'push']),
    ('weight_reminder', 'Rappel pesée', 'biometric', 'Pesée du jour', 'N''oubliez pas de vous peser aujourd''hui', '⚖️', 'low', ARRAY['in_app']),
    ('hydration_reminder', 'Rappel hydratation', 'biometric', 'Hydratation', 'Pensez à boire de l''eau! Objectif: {{goal}}L', '💧', 'low', ARRAY['in_app']),
    ('meal_reminder', 'Rappel repas', 'biometric', 'Heure du repas', 'C''est l''heure de votre {{meal_type}}', '🍽️', 'low', ARRAY['in_app']),

    -- Contenu
    ('new_content', 'Nouveau contenu', 'content', 'Nouveau contenu disponible', 'Découvrez: {{title}}', '📚', 'low', ARRAY['in_app']),
    ('new_recipe', 'Nouvelle recette', 'content', 'Nouvelle recette', 'Une nouvelle recette correspond à vos préférences: {{title}}', '👨‍🍳', 'low', ARRAY['in_app']),

    -- Système
    ('welcome', 'Bienvenue', 'system', 'Bienvenue sur NutriSensia!', 'Votre compte a été créé avec succès', '👋', 'normal', ARRAY['in_app', 'email']),
    ('questionnaire_due', 'Questionnaire à remplir', 'system', 'Questionnaire en attente', 'Vous avez un questionnaire de suivi à compléter', '📝', 'normal', ARRAY['in_app', 'email']),
    ('streak_milestone', 'Jalon streak', 'system', 'Série de {{days}} jours! 🔥', 'Vous avez maintenu votre série pendant {{days}} jours', '🔥', 'normal', ARRAY['in_app', 'push']),
    ('badge_earned', 'Badge gagné', 'system', 'Nouveau badge!', 'Vous avez débloqué le badge "{{badge_name}}"', '🏅', 'normal', ARRAY['in_app'])
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- TABLE: notifications
-- Description: Notifications utilisateur
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Destinataire
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Type
    notification_type_id UUID REFERENCES notification_types(id) ON DELETE SET NULL,
    notification_code VARCHAR(50), -- Code du type si notification_type_id est NULL

    -- Contenu
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    icon VARCHAR(50),

    -- Données additionnelles (pour actions, liens, etc.)
    data JSONB DEFAULT '{}',

    -- Action
    action_url TEXT, -- URL vers laquelle rediriger
    action_label VARCHAR(50), -- Label du bouton d'action

    -- Priorité
    priority notification_priority DEFAULT 'normal',

    -- Statut
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_dismissed BOOLEAN DEFAULT false,
    dismissed_at TIMESTAMPTZ,

    -- Canaux utilisés
    channels_sent TEXT[] DEFAULT ARRAY['in_app'],
    email_sent_at TIMESTAMPTZ,
    push_sent_at TIMESTAMPTZ,

    -- Programmation
    scheduled_for TIMESTAMPTZ, -- Si NULL, envoyé immédiatement
    sent_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ -- Si défini, la notification expire après cette date
);

-- Index
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(notification_type_id);
CREATE INDEX idx_notifications_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) WHERE scheduled_for IS NOT NULL AND sent_at IS NULL;
CREATE INDEX idx_notifications_active ON notifications(user_id, is_dismissed, expires_at)
    WHERE is_dismissed = false;

-- ============================================================================
-- TABLE: notification_preferences
-- Description: Préférences de notification par utilisateur et type
-- User Story: NOTIF-005
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Type de notification
    notification_type_id UUID REFERENCES notification_types(id) ON DELETE CASCADE,
    notification_category notification_category, -- Alternative au type spécifique

    -- Canaux activés
    in_app_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,

    -- Heures de non-dérangement
    quiet_hours_start TIME,
    quiet_hours_end TIME,

    -- Fréquence (pour certains types)
    frequency VARCHAR(20), -- 'realtime', 'daily_digest', 'weekly_digest', 'never'

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte: soit type soit catégorie
    CONSTRAINT notification_preferences_check CHECK (
        notification_type_id IS NOT NULL OR notification_category IS NOT NULL
    ),
    -- Contrainte d'unicité
    UNIQUE(user_id, notification_type_id),
    UNIQUE(user_id, notification_category)
);

-- Trigger pour updated_at
CREATE TRIGGER notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_type ON notification_preferences(notification_type_id);

-- ============================================================================
-- TABLE: push_subscriptions
-- Description: Abonnements push pour notifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Endpoint et clés
    endpoint TEXT NOT NULL UNIQUE,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,

    -- Appareil
    device_type VARCHAR(30), -- 'web', 'ios', 'android'
    device_name VARCHAR(100),
    user_agent TEXT,

    -- Statut
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ DEFAULT now(),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(user_id, is_active) WHERE is_active = true;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Fonction pour créer une notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type_code VARCHAR,
    p_data JSONB DEFAULT '{}',
    p_scheduled_for TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_type RECORD;
    v_notification_id UUID;
    v_title VARCHAR;
    v_body TEXT;
    v_prefs RECORD;
    v_channels TEXT[];
    v_key TEXT;
BEGIN
    -- Récupérer le type de notification
    SELECT * INTO v_type FROM notification_types WHERE code = p_type_code AND is_active = true;

    IF v_type IS NULL THEN
        RAISE EXCEPTION 'Unknown notification type: %', p_type_code;
    END IF;

    -- Appliquer les templates
    v_title := v_type.title_template_fr;
    v_body := v_type.body_template_fr;

    -- Remplacer les variables dans les templates
    FOR v_key IN SELECT jsonb_object_keys(p_data) LOOP
        v_title := replace(v_title, '{{' || v_key || '}}', p_data->>v_key);
        v_body := replace(v_body, '{{' || v_key || '}}', p_data->>v_key);
    END LOOP;

    -- Vérifier les préférences utilisateur
    SELECT * INTO v_prefs
    FROM notification_preferences
    WHERE user_id = p_user_id
    AND (notification_type_id = v_type.id OR notification_category = v_type.category);

    -- Déterminer les canaux
    IF v_prefs IS NOT NULL THEN
        v_channels := ARRAY[]::TEXT[];
        IF v_prefs.in_app_enabled THEN v_channels := v_channels || 'in_app'; END IF;
        IF v_prefs.email_enabled THEN v_channels := v_channels || 'email'; END IF;
        IF v_prefs.push_enabled THEN v_channels := v_channels || 'push'; END IF;
    ELSE
        v_channels := v_type.default_channels;
    END IF;

    -- Si aucun canal, ne pas créer la notification
    IF array_length(v_channels, 1) IS NULL THEN
        RETURN NULL;
    END IF;

    -- Créer la notification
    INSERT INTO notifications (
        user_id, notification_type_id, notification_code,
        title, body, icon, data,
        priority, channels_sent,
        scheduled_for, sent_at
    ) VALUES (
        p_user_id, v_type.id, p_type_code,
        v_title, v_body, v_type.icon, p_data,
        v_type.priority, v_channels,
        p_scheduled_for,
        CASE WHEN p_scheduled_for IS NULL THEN now() ELSE NULL END
    )
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour marquer les notifications comme lues
CREATE OR REPLACE FUNCTION mark_notifications_read(
    p_user_id UUID,
    p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    IF p_notification_ids IS NULL THEN
        -- Marquer toutes les notifications comme lues
        UPDATE notifications
        SET is_read = true, read_at = now()
        WHERE user_id = p_user_id AND is_read = false;
    ELSE
        -- Marquer les notifications spécifiques
        UPDATE notifications
        SET is_read = true, read_at = now()
        WHERE id = ANY(p_notification_ids) AND user_id = p_user_id;
    END IF;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le nombre de notifications non lues
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id = p_user_id
        AND is_read = false
        AND is_dismissed = false
        AND (expires_at IS NULL OR expires_at > now())
    );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les anciennes notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications(
    p_days_read INTEGER DEFAULT 30,
    p_days_unread INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE (
        (is_read = true AND read_at < now() - (p_days_read || ' days')::INTERVAL)
        OR (is_read = false AND created_at < now() - (p_days_unread || ' days')::INTERVAL)
        OR (expires_at IS NOT NULL AND expires_at < now())
    );

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE notification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politiques pour notification_types (lecture pour tous les authentifiés)
DROP POLICY IF EXISTS notification_types_read ON notification_types;
CREATE POLICY notification_types_read ON notification_types
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS notification_types_manage ON notification_types;
CREATE POLICY notification_types_manage ON notification_types
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour notifications
DROP POLICY IF EXISTS notifications_own ON notifications;
CREATE POLICY notifications_own ON notifications
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour notification_preferences
DROP POLICY IF EXISTS notification_preferences_own ON notification_preferences;
CREATE POLICY notification_preferences_own ON notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour push_subscriptions
DROP POLICY IF EXISTS push_subscriptions_own ON push_subscriptions;
CREATE POLICY push_subscriptions_own ON push_subscriptions
    FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE notification_types IS 'Types de notifications système avec templates';
COMMENT ON TABLE notifications IS 'Notifications utilisateur';
COMMENT ON TABLE notification_preferences IS 'Préférences de notification par utilisateur (NOTIF-005)';
COMMENT ON TABLE push_subscriptions IS 'Abonnements push pour notifications';

COMMENT ON FUNCTION create_notification IS 'Crée une notification avec templates et préférences';
COMMENT ON FUNCTION mark_notifications_read IS 'Marque les notifications comme lues';
COMMENT ON FUNCTION get_unread_notification_count IS 'Compte les notifications non lues';
COMMENT ON FUNCTION cleanup_old_notifications IS 'Nettoie les anciennes notifications';
