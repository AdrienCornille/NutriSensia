-- =====================================================
-- NutriSensia - Schéma pour les tests A/B et feature flags
-- Support de l'infrastructure A/B testing pour l'onboarding
-- =====================================================

-- Activation des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE AB_TEST_EVENTS
-- Stockage de tous les événements liés aux tests A/B
-- =====================================================

CREATE TABLE IF NOT EXISTS ab_test_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification de l'événement
    event_type TEXT NOT NULL CHECK (event_type IN (
        'flag_assignment',
        'flag_exposure',
        'onboarding_start',
        'onboarding_step',
        'onboarding_complete',
        'onboarding_abandon',
        'form_validation_error',
        'help_requested',
        'skip_step',
        'conversion',
        'engagement',
        'error',
        'performance'
    )),
    
    -- Identification utilisateur et session
    user_id TEXT NOT NULL, -- Peut être un UUID d'utilisateur authentifié ou un visitor ID
    session_id TEXT NOT NULL,
    
    -- Informations sur le feature flag
    flag_key TEXT NOT NULL,
    flag_value TEXT NOT NULL,
    variant TEXT NOT NULL,
    
    -- Contexte utilisateur
    user_role TEXT CHECK (user_role IN ('nutritionist', 'patient', 'admin')),
    
    -- Informations spécifiques à l'onboarding
    onboarding_step TEXT,
    step_index INTEGER,
    total_steps INTEGER,
    
    -- Métriques de performance et engagement
    duration_ms INTEGER, -- Durée de l'action en millisecondes
    
    -- Informations d'erreur
    error_message TEXT,
    form_field TEXT,
    interaction_type TEXT,
    
    -- Informations techniques
    user_agent TEXT,
    device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    country TEXT,
    
    -- Données personnalisées (JSON)
    custom_data JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les performances des requêtes analytiques
CREATE INDEX idx_ab_test_events_flag_key ON ab_test_events(flag_key);
CREATE INDEX idx_ab_test_events_user_id ON ab_test_events(user_id);
CREATE INDEX idx_ab_test_events_session_id ON ab_test_events(session_id);
CREATE INDEX idx_ab_test_events_event_type ON ab_test_events(event_type);
CREATE INDEX idx_ab_test_events_variant ON ab_test_events(variant);
CREATE INDEX idx_ab_test_events_user_role ON ab_test_events(user_role);
CREATE INDEX idx_ab_test_events_created_at ON ab_test_events(created_at);

-- Index composés pour les requêtes analytiques complexes
CREATE INDEX idx_ab_test_events_flag_variant_event ON ab_test_events(flag_key, variant, event_type);
CREATE INDEX idx_ab_test_events_user_flag_created ON ab_test_events(user_id, flag_key, created_at);
CREATE INDEX idx_ab_test_events_session_step ON ab_test_events(session_id, onboarding_step);

-- Index GIN pour les requêtes sur custom_data
CREATE INDEX idx_ab_test_events_custom_data ON ab_test_events USING GIN (custom_data);

-- =====================================================
-- TABLE AB_TEST_CONFIGURATIONS
-- Configuration des tests A/B actifs
-- =====================================================

CREATE TABLE IF NOT EXISTS ab_test_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification du test
    flag_key TEXT NOT NULL UNIQUE,
    test_name TEXT NOT NULL,
    description TEXT,
    
    -- Configuration du test
    variants JSONB NOT NULL, -- Configuration des variantes et leur distribution
    target_audience JSONB DEFAULT '{}'::jsonb, -- Critères de ciblage
    
    -- Statut et contrôle
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    
    -- Objectifs et métriques
    primary_metric TEXT NOT NULL, -- Métrique principale à optimiser
    secondary_metrics TEXT[] DEFAULT ARRAY[]::TEXT[], -- Métriques secondaires
    success_criteria JSONB DEFAULT '{}'::jsonb, -- Critères de succès
    
    -- Planning
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    min_sample_size INTEGER DEFAULT 100,
    max_duration_days INTEGER DEFAULT 30,
    
    -- Métadonnées
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date < end_date),
    CONSTRAINT valid_sample_size CHECK (min_sample_size > 0),
    CONSTRAINT valid_duration CHECK (max_duration_days > 0)
);

-- Index pour les configurations de tests
CREATE INDEX idx_ab_test_configs_flag_key ON ab_test_configurations(flag_key);
CREATE INDEX idx_ab_test_configs_status ON ab_test_configurations(status);
CREATE INDEX idx_ab_test_configs_dates ON ab_test_configurations(start_date, end_date);
CREATE INDEX idx_ab_test_configs_created_by ON ab_test_configurations(created_by);

-- =====================================================
-- TABLE AB_TEST_RESULTS_SUMMARY
-- Résumé des résultats des tests A/B (table de cache)
-- =====================================================

CREATE TABLE IF NOT EXISTS ab_test_results_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification
    flag_key TEXT NOT NULL,
    variant TEXT NOT NULL,
    
    -- Période d'analyse
    analysis_period_start TIMESTAMPTZ NOT NULL,
    analysis_period_end TIMESTAMPTZ NOT NULL,
    
    -- Métriques agrégées
    total_users INTEGER NOT NULL DEFAULT 0,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_conversions INTEGER NOT NULL DEFAULT 0,
    conversion_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    
    -- Métriques de performance
    average_session_duration_ms INTEGER,
    average_time_to_conversion_ms INTEGER,
    bounce_rate DECIMAL(5,4),
    
    -- Métriques d'engagement
    total_interactions INTEGER DEFAULT 0,
    average_interactions_per_user DECIMAL(8,2),
    
    -- Métriques d'abandon
    abandonment_rate DECIMAL(5,4),
    most_common_abandonment_step TEXT,
    
    -- Analyse statistique
    confidence_level DECIMAL(5,4),
    statistical_significance BOOLEAN DEFAULT FALSE,
    p_value DECIMAL(10,8),
    
    -- Métadonnées
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(flag_key, variant, analysis_period_start, analysis_period_end),
    CONSTRAINT valid_conversion_rate CHECK (conversion_rate >= 0.0000 AND conversion_rate <= 1.0000),
    CONSTRAINT valid_confidence CHECK (confidence_level >= 0.0000 AND confidence_level <= 1.0000)
);

-- Index pour les résumés
CREATE INDEX idx_ab_results_summary_flag_key ON ab_test_results_summary(flag_key);
CREATE INDEX idx_ab_results_summary_variant ON ab_test_results_summary(variant);
CREATE INDEX idx_ab_results_summary_period ON ab_test_results_summary(analysis_period_start, analysis_period_end);
CREATE INDEX idx_ab_results_summary_conversion_rate ON ab_test_results_summary(conversion_rate DESC);

-- =====================================================
-- VUES ANALYTIQUES
-- Vues pour simplifier les requêtes analytiques
-- =====================================================

-- Vue pour les conversions par variante
CREATE OR REPLACE VIEW ab_test_conversions_by_variant AS
SELECT 
    flag_key,
    variant,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(*) FILTER (WHERE event_type = 'conversion') as conversions,
    COUNT(*) FILTER (WHERE event_type = 'onboarding_complete') as completions,
    COUNT(*) FILTER (WHERE event_type = 'onboarding_abandon') as abandonments,
    ROUND(
        COUNT(*) FILTER (WHERE event_type = 'conversion')::DECIMAL / 
        NULLIF(COUNT(DISTINCT user_id), 0) * 100, 
        2
    ) as conversion_rate_percent,
    DATE_TRUNC('day', created_at) as day
FROM ab_test_events
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY flag_key, variant, DATE_TRUNC('day', created_at)
ORDER BY flag_key, variant, day;

-- Vue pour l'analyse des étapes d'onboarding
CREATE OR REPLACE VIEW ab_test_onboarding_funnel AS
SELECT 
    flag_key,
    variant,
    onboarding_step,
    step_index,
    COUNT(DISTINCT user_id) as users_reached,
    COUNT(*) FILTER (WHERE event_type = 'onboarding_step') as step_completions,
    COUNT(*) FILTER (WHERE event_type = 'onboarding_abandon') as step_abandonments,
    AVG(duration_ms) FILTER (WHERE duration_ms IS NOT NULL) as avg_duration_ms,
    ROUND(
        COUNT(*) FILTER (WHERE event_type = 'onboarding_abandon')::DECIMAL / 
        NULLIF(COUNT(DISTINCT user_id), 0) * 100, 
        2
    ) as abandonment_rate_percent
FROM ab_test_events
WHERE onboarding_step IS NOT NULL
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY flag_key, variant, onboarding_step, step_index
ORDER BY flag_key, variant, step_index;

-- Vue pour les métriques de performance par device
CREATE OR REPLACE VIEW ab_test_performance_by_device AS
SELECT 
    flag_key,
    variant,
    device_type,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(duration_ms) FILTER (WHERE duration_ms IS NOT NULL) as avg_duration_ms,
    COUNT(*) FILTER (WHERE event_type = 'conversion') as conversions,
    COUNT(*) FILTER (WHERE event_type = 'error') as errors,
    ROUND(
        COUNT(*) FILTER (WHERE event_type = 'conversion')::DECIMAL / 
        NULLIF(COUNT(DISTINCT user_id), 0) * 100, 
        2
    ) as conversion_rate_percent
FROM ab_test_events
WHERE device_type IS NOT NULL
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY flag_key, variant, device_type
ORDER BY flag_key, variant, device_type;

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour calculer la significativité statistique
CREATE OR REPLACE FUNCTION calculate_statistical_significance(
    control_conversions INTEGER,
    control_users INTEGER,
    variant_conversions INTEGER,
    variant_users INTEGER
) RETURNS TABLE (
    p_value DECIMAL(10,8),
    is_significant BOOLEAN,
    confidence_level DECIMAL(5,4)
) AS $$
DECLARE
    control_rate DECIMAL;
    variant_rate DECIMAL;
    pooled_rate DECIMAL;
    pooled_se DECIMAL;
    z_score DECIMAL;
    calculated_p_value DECIMAL;
BEGIN
    -- Calcul des taux de conversion
    control_rate := control_conversions::DECIMAL / NULLIF(control_users, 0);
    variant_rate := variant_conversions::DECIMAL / NULLIF(variant_users, 0);
    
    -- Si pas assez de données, retourner non significatif
    IF control_users < 30 OR variant_users < 30 THEN
        RETURN QUERY SELECT 1.0::DECIMAL(10,8), FALSE, 0.0::DECIMAL(5,4);
        RETURN;
    END IF;
    
    -- Calcul du taux poolé et de l'erreur standard
    pooled_rate := (control_conversions + variant_conversions)::DECIMAL / 
                   NULLIF(control_users + variant_users, 0);
    pooled_se := SQRT(pooled_rate * (1 - pooled_rate) * 
                     (1.0/control_users + 1.0/variant_users));
    
    -- Calcul du z-score
    IF pooled_se > 0 THEN
        z_score := ABS(variant_rate - control_rate) / pooled_se;
        -- Approximation simple du p-value (pour une vraie implémentation, utiliser une fonction statistique appropriée)
        calculated_p_value := CASE 
            WHEN z_score > 2.58 THEN 0.01
            WHEN z_score > 1.96 THEN 0.05
            WHEN z_score > 1.65 THEN 0.10
            ELSE 0.50
        END;
    ELSE
        calculated_p_value := 1.0;
    END IF;
    
    RETURN QUERY SELECT 
        calculated_p_value::DECIMAL(10,8),
        calculated_p_value < 0.05,
        CASE 
            WHEN calculated_p_value < 0.01 THEN 0.99
            WHEN calculated_p_value < 0.05 THEN 0.95
            WHEN calculated_p_value < 0.10 THEN 0.90
            ELSE 0.00
        END::DECIMAL(5,4);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ab_test_events_updated_at
    BEFORE UPDATE ON ab_test_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ab_test_configurations_updated_at
    BEFORE UPDATE ON ab_test_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activation de RLS
ALTER TABLE ab_test_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results_summary ENABLE ROW LEVEL SECURITY;

-- Politique pour les événements A/B - lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can read ab_test_events" 
ON ab_test_events FOR SELECT 
TO authenticated 
USING (true);

-- Politique pour les événements A/B - insertion pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can insert ab_test_events" 
ON ab_test_events FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Politique pour les configurations - lecture limitée aux admins et nutritionnistes
CREATE POLICY "Admin and nutritionist can read ab_test_configurations" 
ON ab_test_configurations FOR SELECT 
TO authenticated 
USING (
    auth.jwt() ->> 'role' IN ('admin', 'nutritionist') OR
    auth.uid() = created_by
);

-- Politique pour les configurations - modification limitée aux admins
CREATE POLICY "Admin can modify ab_test_configurations" 
ON ab_test_configurations FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Politique pour les résumés - lecture pour les utilisateurs autorisés
CREATE POLICY "Authorized users can read ab_test_results_summary" 
ON ab_test_results_summary FOR SELECT 
TO authenticated 
USING (auth.jwt() ->> 'role' IN ('admin', 'nutritionist'));

-- =====================================================
-- DONNÉES D'EXEMPLE (OPTIONNEL)
-- =====================================================

-- Configuration de test exemple pour l'onboarding des nutritionnistes
INSERT INTO ab_test_configurations (
    flag_key,
    test_name,
    description,
    variants,
    target_audience,
    status,
    primary_metric,
    secondary_metrics,
    success_criteria,
    start_date,
    min_sample_size
) VALUES (
    'nutritionist-onboarding-variant',
    'Test A/B Onboarding Nutritionnistes',
    'Optimisation du parcours d''onboarding pour améliorer le taux de completion',
    '{
        "control": {"weight": 25, "description": "Parcours standard actuel"},
        "simplified": {"weight": 25, "description": "Version simplifiée avec moins d''étapes"},
        "gamified": {"weight": 25, "description": "Version avec éléments de gamification"},
        "guided": {"weight": 25, "description": "Version avec plus d''aide contextuelle"}
    }',
    '{
        "user_role": ["nutritionist"],
        "device_type": ["desktop", "tablet", "mobile"],
        "countries": ["FR", "CH", "BE"]
    }',
    'active',
    'conversion_rate',
    ARRAY['time_to_completion', 'step_completion_rate', 'user_satisfaction'],
    '{
        "min_improvement": 0.05,
        "min_confidence": 0.95,
        "min_sample_size": 200
    }',
    NOW(),
    200
) ON CONFLICT (flag_key) DO NOTHING;

-- =====================================================
-- COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON TABLE ab_test_events IS 'Stockage de tous les événements liés aux tests A/B et feature flags';
COMMENT ON TABLE ab_test_configurations IS 'Configuration des tests A/B actifs et leurs paramètres';
COMMENT ON TABLE ab_test_results_summary IS 'Résumé précalculé des résultats des tests A/B pour optimiser les performances';

COMMENT ON COLUMN ab_test_events.flag_key IS 'Identifiant du feature flag concerné';
COMMENT ON COLUMN ab_test_events.variant IS 'Variante du test A/B attribuée à l''utilisateur';
COMMENT ON COLUMN ab_test_events.custom_data IS 'Données personnalisées au format JSON pour des métriques spécifiques';

COMMENT ON VIEW ab_test_conversions_by_variant IS 'Vue agrégée des conversions par variante pour analyse rapide';
COMMENT ON VIEW ab_test_onboarding_funnel IS 'Analyse du funnel d''onboarding par étape et variante';
COMMENT ON VIEW ab_test_performance_by_device IS 'Métriques de performance segmentées par type d''appareil';
