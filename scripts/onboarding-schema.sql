-- =====================================================
-- NutriSensia - Schéma pour le système d'onboarding
-- Support de la progression et des données d'onboarding
-- =====================================================

-- Activation des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE ONBOARDING_PROGRESS
-- Suivi de la progression de l'onboarding par utilisateur
-- =====================================================

CREATE TABLE IF NOT EXISTS onboarding_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_role TEXT NOT NULL CHECK (user_role IN ('nutritionist', 'patient', 'admin')),
    current_step TEXT NOT NULL,
    steps JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte unique par utilisateur et rôle
    UNIQUE(user_id, user_role)
);

-- Index pour optimiser les performances
CREATE INDEX idx_onboarding_progress_user_id ON onboarding_progress(user_id);
CREATE INDEX idx_onboarding_progress_user_role ON onboarding_progress(user_role);
CREATE INDEX idx_onboarding_progress_is_completed ON onboarding_progress(is_completed);
CREATE INDEX idx_onboarding_progress_started_at ON onboarding_progress(started_at);

-- =====================================================
-- TABLE USER_ONBOARDING
-- Données finales d'onboarding par utilisateur
-- =====================================================

CREATE TABLE IF NOT EXISTS user_onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_role TEXT NOT NULL CHECK (user_role IN ('nutritionist', 'patient', 'admin')),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_data JSONB NULL,
    completed_at TIMESTAMPTZ NULL,
    skipped_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
    training_completed BOOLEAN DEFAULT FALSE,
    training_modules_completed TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte unique par utilisateur
    UNIQUE(user_id)
);

-- Index pour optimiser les performances
CREATE INDEX idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX idx_user_onboarding_completed ON user_onboarding(onboarding_completed);
CREATE INDEX idx_user_onboarding_user_role ON user_onboarding(user_role);

-- =====================================================
-- TABLE ONBOARDING_ANALYTICS
-- Analytics et événements d'onboarding
-- =====================================================

CREATE TABLE IF NOT EXISTS onboarding_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB NULL,
    step_id TEXT NULL,
    duration_ms INTEGER NULL,
    user_agent TEXT NULL,
    ip_address INET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX idx_onboarding_analytics_user_id ON onboarding_analytics(user_id);
CREATE INDEX idx_onboarding_analytics_event_type ON onboarding_analytics(event_type);
CREATE INDEX idx_onboarding_analytics_created_at ON onboarding_analytics(created_at);
CREATE INDEX idx_onboarding_analytics_step_id ON onboarding_analytics(step_id);

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mise à jour automatique des timestamps
CREATE TRIGGER update_onboarding_progress_updated_at 
    BEFORE UPDATE ON onboarding_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_onboarding_updated_at 
    BEFORE UPDATE ON user_onboarding 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer le pourcentage de completion
CREATE OR REPLACE FUNCTION calculate_completion_percentage(steps_data JSONB)
RETURNS INTEGER AS $$
DECLARE
    total_steps INTEGER;
    completed_steps INTEGER;
BEGIN
    -- Compter le nombre total d'étapes
    SELECT jsonb_object_length(steps_data) INTO total_steps;
    
    -- Compter les étapes terminées
    SELECT COUNT(*)
    FROM jsonb_each(steps_data) AS step(key, value)
    WHERE (value->>'status') = 'completed'
    INTO completed_steps;
    
    -- Calculer le pourcentage
    IF total_steps > 0 THEN
        RETURN ROUND((completed_steps::DECIMAL / total_steps::DECIMAL) * 100);
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour automatiquement le pourcentage
CREATE OR REPLACE FUNCTION update_completion_percentage()
RETURNS TRIGGER AS $$
BEGIN
    NEW.completion_percentage = calculate_completion_percentage(NEW.steps);
    NEW.is_completed = (NEW.completion_percentage = 100);
    
    -- Si l'onboarding est terminé, mettre à jour completed_at
    IF NEW.is_completed AND OLD.completed_at IS NULL THEN
        NEW.completed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mise à jour automatique du pourcentage
CREATE TRIGGER update_onboarding_completion
    BEFORE UPDATE ON onboarding_progress
    FOR EACH ROW
    WHEN (OLD.steps IS DISTINCT FROM NEW.steps)
    EXECUTE FUNCTION update_completion_percentage();

-- =====================================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Activation RLS sur toutes les tables
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_analytics ENABLE ROW LEVEL SECURITY;

-- Politiques pour onboarding_progress
CREATE POLICY "Users can view own onboarding progress" ON onboarding_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress" ON onboarding_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all onboarding progress" ON onboarding_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour user_onboarding
CREATE POLICY "Users can view own onboarding data" ON user_onboarding
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding data" ON user_onboarding
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all onboarding data" ON user_onboarding
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour onboarding_analytics
CREATE POLICY "Users can insert own analytics" ON onboarding_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" ON onboarding_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue pour les statistiques d'onboarding
CREATE OR REPLACE VIEW onboarding_stats AS
SELECT 
    user_role,
    COUNT(*) as total_started,
    COUNT(*) FILTER (WHERE is_completed = true) as total_completed,
    ROUND(
        (COUNT(*) FILTER (WHERE is_completed = true)::DECIMAL / COUNT(*)::DECIMAL) * 100, 
        2
    ) as completion_rate,
    AVG(completion_percentage) as avg_completion_percentage,
    AVG(
        EXTRACT(EPOCH FROM (completed_at - started_at)) / 3600
    ) FILTER (WHERE completed_at IS NOT NULL) as avg_completion_hours
FROM onboarding_progress
GROUP BY user_role;

-- Vue pour les événements d'onboarding récents
CREATE OR REPLACE VIEW recent_onboarding_events AS
SELECT 
    oa.*,
    p.first_name,
    p.last_name,
    p.role as user_role
FROM onboarding_analytics oa
LEFT JOIN profiles p ON oa.user_id = p.id
WHERE oa.created_at >= NOW() - INTERVAL '7 days'
ORDER BY oa.created_at DESC;

-- =====================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- =====================================================

-- Insérer quelques données de test si nécessaire
-- ATTENTION: À supprimer en production

/*
INSERT INTO onboarding_progress (user_id, user_role, current_step, steps) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'nutritionist',
    'personal-info',
    '{
        "welcome": {"id": "welcome", "title": "Bienvenue", "status": "completed", "completedAt": "2024-01-01T10:00:00Z"},
        "personal-info": {"id": "personal-info", "title": "Informations personnelles", "status": "in-progress"}
    }'::jsonb
);
*/

-- =====================================================
-- COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON TABLE onboarding_progress IS 'Suivi de la progression de l''onboarding par utilisateur';
COMMENT ON TABLE user_onboarding IS 'Données finales d''onboarding par utilisateur';
COMMENT ON TABLE onboarding_analytics IS 'Analytics et événements d''onboarding pour optimisation';

COMMENT ON COLUMN onboarding_progress.steps IS 'Structure JSON des étapes avec leur statut et métadonnées';
COMMENT ON COLUMN onboarding_progress.completion_percentage IS 'Pourcentage de completion calculé automatiquement';
COMMENT ON COLUMN user_onboarding.onboarding_data IS 'Données finales collectées pendant l''onboarding';
COMMENT ON COLUMN user_onboarding.skipped_steps IS 'Liste des étapes passées par l''utilisateur';

-- =====================================================
-- FINALISATION
-- =====================================================

-- Vérifier que tout s'est bien passé
DO $$
BEGIN
    RAISE NOTICE 'Schéma d''onboarding créé avec succès !';
    RAISE NOTICE 'Tables créées : onboarding_progress, user_onboarding, onboarding_analytics';
    RAISE NOTICE 'Vues créées : onboarding_stats, recent_onboarding_events';
    RAISE NOTICE 'Politiques RLS activées pour la sécurité';
END $$;

