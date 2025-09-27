-- =====================================================
-- NutriSensia - Schéma pour le déploiement progressif
-- Support du système de gradual rollout pour les feature flags
-- =====================================================

-- Activation des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE GRADUAL_ROLLOUT_CONFIGS
-- Configuration des déploiements progressifs
-- =====================================================

CREATE TABLE IF NOT EXISTS gradual_rollout_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification
    flag_key TEXT NOT NULL,
    target_variant TEXT NOT NULL,
    rollout_name TEXT,
    description TEXT,
    
    -- Configuration du déploiement
    initial_percentage INTEGER NOT NULL CHECK (initial_percentage >= 0 AND initial_percentage <= 100),
    target_percentage INTEGER NOT NULL CHECK (target_percentage >= 0 AND target_percentage <= 100),
    increment_percentage INTEGER NOT NULL CHECK (increment_percentage > 0 AND increment_percentage <= 50),
    increment_interval_hours INTEGER NOT NULL CHECK (increment_interval_hours >= 1),
    
    -- Critères de validation
    min_sample_size INTEGER DEFAULT 100 CHECK (min_sample_size > 0),
    max_error_rate DECIMAL(5,4) DEFAULT 0.05 CHECK (max_error_rate >= 0.0000 AND max_error_rate <= 1.0000),
    min_conversion_rate DECIMAL(5,4) DEFAULT 0.10 CHECK (min_conversion_rate >= 0.0000 AND min_conversion_rate <= 1.0000),
    
    -- Critères d'arrêt d'urgence
    emergency_stop_conditions JSONB NOT NULL DEFAULT '{
        "maxErrorRateSpike": 0.10,
        "minConversionRateDrop": 0.05,
        "maxUserComplaints": 10
    }'::jsonb,
    
    -- Ciblage et filtres
    target_audience JSONB DEFAULT '{}'::jsonb,
    exclusion_criteria JSONB DEFAULT '{}'::jsonb,
    
    -- Planning
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    timezone TEXT DEFAULT 'UTC',
    
    -- Notifications
    notification_settings JSONB DEFAULT '{
        "onIncrement": true,
        "onCompletion": true,
        "onRollback": true,
        "onEmergencyStop": true,
        "channels": ["email"]
    }'::jsonb,
    
    -- Métadonnées
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT valid_percentage_range CHECK (target_percentage >= initial_percentage),
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date < end_date),
    CONSTRAINT valid_increment CHECK (increment_percentage <= (target_percentage - initial_percentage))
);

-- Index pour les configurations
CREATE INDEX idx_gradual_rollout_configs_flag_key ON gradual_rollout_configs(flag_key);
CREATE INDEX idx_gradual_rollout_configs_target_variant ON gradual_rollout_configs(target_variant);
CREATE INDEX idx_gradual_rollout_configs_start_date ON gradual_rollout_configs(start_date);
CREATE INDEX idx_gradual_rollout_configs_created_by ON gradual_rollout_configs(created_by);

-- =====================================================
-- TABLE GRADUAL_ROLLOUT_STATUS
-- Statut actuel des déploiements progressifs
-- =====================================================

CREATE TABLE IF NOT EXISTS gradual_rollout_status (
    id UUID PRIMARY KEY REFERENCES gradual_rollout_configs(id) ON DELETE CASCADE,
    
    -- Identification
    flag_key TEXT NOT NULL,
    target_variant TEXT NOT NULL,
    
    -- État actuel
    current_percentage INTEGER NOT NULL CHECK (current_percentage >= 0 AND current_percentage <= 100),
    target_percentage INTEGER NOT NULL CHECK (target_percentage >= 0 AND target_percentage <= 100),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'rolled_back', 'failed')),
    
    -- Statistiques actuelles
    current_stats JSONB NOT NULL DEFAULT '{
        "totalUsers": 0,
        "errorRate": 0.0,
        "conversionRate": 0.0,
        "userFeedbackScore": 0.0
    }'::jsonb,
    
    -- Historique des incréments
    increment_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Prochaine action programmée
    next_scheduled_increment JSONB,
    
    -- Métriques de performance
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    
    -- Alertes et notifications
    active_alerts JSONB DEFAULT '[]'::jsonb,
    notification_history JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    last_metrics_update TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les statuts
CREATE INDEX idx_gradual_rollout_status_flag_key ON gradual_rollout_status(flag_key);
CREATE INDEX idx_gradual_rollout_status_status ON gradual_rollout_status(status);
CREATE INDEX idx_gradual_rollout_status_current_percentage ON gradual_rollout_status(current_percentage);
CREATE INDEX idx_gradual_rollout_status_last_updated ON gradual_rollout_status(last_updated);

-- Index GIN pour les requêtes sur JSONB
CREATE INDEX idx_gradual_rollout_status_current_stats ON gradual_rollout_status USING GIN (current_stats);
CREATE INDEX idx_gradual_rollout_status_increment_history ON gradual_rollout_status USING GIN (increment_history);

-- =====================================================
-- TABLE ROLLOUT_METRICS_SNAPSHOTS
-- Snapshots des métriques pour analyse historique
-- =====================================================

CREATE TABLE IF NOT EXISTS rollout_metrics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Référence au déploiement
    rollout_id UUID NOT NULL REFERENCES gradual_rollout_configs(id) ON DELETE CASCADE,
    flag_key TEXT NOT NULL,
    target_variant TEXT NOT NULL,
    
    -- État au moment du snapshot
    percentage_at_snapshot INTEGER NOT NULL,
    status_at_snapshot TEXT NOT NULL,
    
    -- Métriques capturées
    metrics JSONB NOT NULL,
    
    -- Métriques détaillées
    user_metrics JSONB DEFAULT '{}'::jsonb, -- Métriques utilisateurs (nouveaux, actifs, etc.)
    conversion_metrics JSONB DEFAULT '{}'::jsonb, -- Métriques de conversion détaillées
    performance_metrics JSONB DEFAULT '{}'::jsonb, -- Métriques de performance (latence, erreurs, etc.)
    business_metrics JSONB DEFAULT '{}'::jsonb, -- Métriques business spécifiques
    
    -- Comparaison avec la variante de contrôle
    control_comparison JSONB DEFAULT '{}'::jsonb,
    
    -- Contexte du snapshot
    snapshot_reason TEXT NOT NULL CHECK (snapshot_reason IN (
        'scheduled',
        'increment',
        'alert',
        'manual',
        'completion',
        'rollback'
    )),
    snapshot_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les snapshots
CREATE INDEX idx_rollout_metrics_snapshots_rollout_id ON rollout_metrics_snapshots(rollout_id);
CREATE INDEX idx_rollout_metrics_snapshots_flag_key ON rollout_metrics_snapshots(flag_key);
CREATE INDEX idx_rollout_metrics_snapshots_created_at ON rollout_metrics_snapshots(created_at);
CREATE INDEX idx_rollout_metrics_snapshots_percentage ON rollout_metrics_snapshots(percentage_at_snapshot);

-- Index GIN pour les métriques JSONB
CREATE INDEX idx_rollout_metrics_snapshots_metrics ON rollout_metrics_snapshots USING GIN (metrics);

-- =====================================================
-- TABLE ROLLOUT_ALERTS
-- Alertes et notifications pour les déploiements
-- =====================================================

CREATE TABLE IF NOT EXISTS rollout_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Référence au déploiement
    rollout_id UUID NOT NULL REFERENCES gradual_rollout_configs(id) ON DELETE CASCADE,
    flag_key TEXT NOT NULL,
    
    -- Type et sévérité de l'alerte
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'error_rate_spike',
        'conversion_drop',
        'performance_degradation',
        'user_feedback_negative',
        'sample_size_insufficient',
        'emergency_stop_triggered',
        'rollback_initiated',
        'increment_delayed',
        'completion_successful'
    )),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Contenu de l'alerte
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    
    -- Métriques qui ont déclenché l'alerte
    trigger_metrics JSONB DEFAULT '{}'::jsonb,
    threshold_breached JSONB DEFAULT '{}'::jsonb,
    
    -- Actions recommandées
    recommended_actions TEXT[],
    
    -- État de l'alerte
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    -- Notifications
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_channels TEXT[] DEFAULT ARRAY[]::TEXT[],
    notification_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les alertes
CREATE INDEX idx_rollout_alerts_rollout_id ON rollout_alerts(rollout_id);
CREATE INDEX idx_rollout_alerts_flag_key ON rollout_alerts(flag_key);
CREATE INDEX idx_rollout_alerts_alert_type ON rollout_alerts(alert_type);
CREATE INDEX idx_rollout_alerts_severity ON rollout_alerts(severity);
CREATE INDEX idx_rollout_alerts_status ON rollout_alerts(status);
CREATE INDEX idx_rollout_alerts_created_at ON rollout_alerts(created_at);

-- =====================================================
-- VUES ANALYTIQUES
-- =====================================================

-- Vue pour le dashboard des déploiements actifs
CREATE OR REPLACE VIEW active_rollouts_dashboard AS
SELECT 
    c.id,
    c.flag_key,
    c.target_variant,
    c.rollout_name,
    s.current_percentage,
    s.target_percentage,
    s.status,
    s.current_stats,
    s.next_scheduled_increment,
    c.start_date,
    s.started_at,
    s.last_updated,
    
    -- Calculs dérivés
    CASE 
        WHEN s.target_percentage > 0 THEN 
            ROUND((s.current_percentage::DECIMAL / s.target_percentage) * 100, 1)
        ELSE 0 
    END as completion_percentage,
    
    -- Prochaine action
    CASE 
        WHEN s.status = 'active' AND s.next_scheduled_increment IS NOT NULL THEN
            (s.next_scheduled_increment->>'scheduledAt')::TIMESTAMPTZ
        ELSE NULL
    END as next_increment_at,
    
    -- Alertes actives
    (
        SELECT COUNT(*) 
        FROM rollout_alerts a 
        WHERE a.rollout_id = c.id AND a.status = 'active'
    ) as active_alerts_count,
    
    -- Dernière métrique de conversion
    (s.current_stats->>'conversionRate')::DECIMAL as current_conversion_rate,
    (s.current_stats->>'errorRate')::DECIMAL as current_error_rate
    
FROM gradual_rollout_configs c
JOIN gradual_rollout_status s ON c.id = s.id
WHERE s.status IN ('active', 'paused')
ORDER BY s.last_updated DESC;

-- Vue pour l'analyse des performances par variante
CREATE OR REPLACE VIEW rollout_performance_analysis AS
SELECT 
    c.flag_key,
    c.target_variant,
    s.status,
    s.current_percentage,
    
    -- Métriques moyennes sur les 7 derniers jours
    AVG((snap.metrics->>'conversionRate')::DECIMAL) as avg_conversion_rate_7d,
    AVG((snap.metrics->>'errorRate')::DECIMAL) as avg_error_rate_7d,
    AVG((snap.metrics->>'totalUsers')::INTEGER) as avg_daily_users_7d,
    
    -- Tendances
    CASE 
        WHEN COUNT(snap.id) >= 2 THEN
            (
                SELECT (latest.metrics->>'conversionRate')::DECIMAL - (earliest.metrics->>'conversionRate')::DECIMAL
                FROM rollout_metrics_snapshots latest
                CROSS JOIN rollout_metrics_snapshots earliest
                WHERE latest.rollout_id = c.id 
                    AND earliest.rollout_id = c.id
                    AND latest.created_at >= CURRENT_DATE - INTERVAL '7 days'
                    AND earliest.created_at >= CURRENT_DATE - INTERVAL '7 days'
                ORDER BY latest.created_at DESC, earliest.created_at ASC
                LIMIT 1
            )
        ELSE 0
    END as conversion_rate_trend_7d,
    
    -- Comparaison avec le contrôle
    AVG((snap.control_comparison->>'conversionRateLift')::DECIMAL) as avg_conversion_lift,
    AVG((snap.control_comparison->>'statisticalSignificance')::DECIMAL) as avg_statistical_significance,
    
    COUNT(snap.id) as snapshots_count,
    MIN(snap.created_at) as first_snapshot,
    MAX(snap.created_at) as last_snapshot
    
FROM gradual_rollout_configs c
JOIN gradual_rollout_status s ON c.id = s.id
LEFT JOIN rollout_metrics_snapshots snap ON c.id = snap.rollout_id 
    AND snap.created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY c.id, c.flag_key, c.target_variant, s.status, s.current_percentage
ORDER BY c.flag_key, c.target_variant;

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour calculer les métriques de performance d'un déploiement
CREATE OR REPLACE FUNCTION calculate_rollout_performance(rollout_id_param UUID, days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    total_users INTEGER,
    conversion_rate DECIMAL(5,4),
    error_rate DECIMAL(5,4),
    avg_session_duration INTEGER,
    user_feedback_score DECIMAL(3,2),
    statistical_significance DECIMAL(5,4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM((metrics->>'totalUsers')::INTEGER), 0) as total_users,
        COALESCE(AVG((metrics->>'conversionRate')::DECIMAL), 0.0)::DECIMAL(5,4) as conversion_rate,
        COALESCE(AVG((metrics->>'errorRate')::DECIMAL), 0.0)::DECIMAL(5,4) as error_rate,
        COALESCE(AVG((performance_metrics->>'avgSessionDuration')::INTEGER), 0) as avg_session_duration,
        COALESCE(AVG((metrics->>'userFeedbackScore')::DECIMAL), 0.0)::DECIMAL(3,2) as user_feedback_score,
        COALESCE(AVG((control_comparison->>'statisticalSignificance')::DECIMAL), 0.0)::DECIMAL(5,4) as statistical_significance
    FROM rollout_metrics_snapshots
    WHERE rollout_id = rollout_id_param
        AND created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer un snapshot de métriques
CREATE OR REPLACE FUNCTION create_metrics_snapshot(
    rollout_id_param UUID,
    reason TEXT DEFAULT 'scheduled'
) RETURNS UUID AS $$
DECLARE
    snapshot_id UUID;
    rollout_config RECORD;
    current_status RECORD;
    calculated_metrics JSONB;
BEGIN
    -- Récupération de la configuration et du statut
    SELECT * INTO rollout_config FROM gradual_rollout_configs WHERE id = rollout_id_param;
    SELECT * INTO current_status FROM gradual_rollout_status WHERE id = rollout_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Rollout not found: %', rollout_id_param;
    END IF;
    
    -- Calcul des métriques (ici simplifié, dans un vrai projet on interrogerait les tables d'analytics)
    calculated_metrics := jsonb_build_object(
        'totalUsers', (current_status.current_stats->>'totalUsers')::INTEGER,
        'conversionRate', (current_status.current_stats->>'conversionRate')::DECIMAL,
        'errorRate', (current_status.current_stats->>'errorRate')::DECIMAL,
        'userFeedbackScore', (current_status.current_stats->>'userFeedbackScore')::DECIMAL,
        'timestamp', EXTRACT(EPOCH FROM NOW())
    );
    
    -- Insertion du snapshot
    INSERT INTO rollout_metrics_snapshots (
        rollout_id,
        flag_key,
        target_variant,
        percentage_at_snapshot,
        status_at_snapshot,
        metrics,
        snapshot_reason,
        snapshot_metadata
    ) VALUES (
        rollout_id_param,
        rollout_config.flag_key,
        rollout_config.target_variant,
        current_status.current_percentage,
        current_status.status,
        calculated_metrics,
        reason,
        jsonb_build_object('created_by', 'system', 'automated', true)
    ) RETURNING id INTO snapshot_id;
    
    RETURN snapshot_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour déclencher une alerte
CREATE OR REPLACE FUNCTION trigger_rollout_alert(
    rollout_id_param UUID,
    alert_type_param TEXT,
    severity_param TEXT,
    title_param TEXT,
    message_param TEXT,
    details_param JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    alert_id UUID;
    rollout_config RECORD;
BEGIN
    -- Récupération de la configuration
    SELECT * INTO rollout_config FROM gradual_rollout_configs WHERE id = rollout_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Rollout not found: %', rollout_id_param;
    END IF;
    
    -- Insertion de l'alerte
    INSERT INTO rollout_alerts (
        rollout_id,
        flag_key,
        alert_type,
        severity,
        title,
        message,
        details
    ) VALUES (
        rollout_id_param,
        rollout_config.flag_key,
        alert_type_param,
        severity_param,
        title_param,
        message_param,
        details_param
    ) RETURNING id INTO alert_id;
    
    -- Mise à jour du statut avec l'alerte active
    UPDATE gradual_rollout_status 
    SET 
        active_alerts = COALESCE(active_alerts, '[]'::jsonb) || jsonb_build_object('alertId', alert_id, 'type', alert_type_param, 'severity', severity_param),
        last_updated = NOW()
    WHERE id = rollout_id_param;
    
    RETURN alert_id;
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

CREATE TRIGGER update_gradual_rollout_configs_updated_at
    BEFORE UPDATE ON gradual_rollout_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gradual_rollout_status_updated_at
    BEFORE UPDATE ON gradual_rollout_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rollout_alerts_updated_at
    BEFORE UPDATE ON rollout_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour créer automatiquement des snapshots lors des incréments
CREATE OR REPLACE FUNCTION auto_create_snapshot_on_increment()
RETURNS TRIGGER AS $$
BEGIN
    -- Si le pourcentage a changé, créer un snapshot
    IF OLD.current_percentage != NEW.current_percentage THEN
        PERFORM create_metrics_snapshot(NEW.id, 'increment');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_snapshot_on_increment
    AFTER UPDATE ON gradual_rollout_status
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_snapshot_on_increment();

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activation de RLS
ALTER TABLE gradual_rollout_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gradual_rollout_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE rollout_metrics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE rollout_alerts ENABLE ROW LEVEL SECURITY;

-- Politiques pour les configurations - lecture limitée aux admins et créateurs
CREATE POLICY "Admin and creators can read rollout configs" 
ON gradual_rollout_configs FOR SELECT 
TO authenticated 
USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.uid() = created_by
);

-- Politiques pour les configurations - modification limitée aux admins
CREATE POLICY "Admin can modify rollout configs" 
ON gradual_rollout_configs FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Politiques pour les statuts - lecture pour les utilisateurs autorisés
CREATE POLICY "Authorized users can read rollout status" 
ON gradual_rollout_status FOR SELECT 
TO authenticated 
USING (
    auth.jwt() ->> 'role' IN ('admin', 'nutritionist') OR
    EXISTS (
        SELECT 1 FROM gradual_rollout_configs c 
        WHERE c.id = gradual_rollout_status.id 
        AND c.created_by = auth.uid()
    )
);

-- Politiques pour les snapshots - lecture pour les utilisateurs autorisés
CREATE POLICY "Authorized users can read metrics snapshots" 
ON rollout_metrics_snapshots FOR SELECT 
TO authenticated 
USING (
    auth.jwt() ->> 'role' IN ('admin', 'nutritionist') OR
    EXISTS (
        SELECT 1 FROM gradual_rollout_configs c 
        WHERE c.id = rollout_metrics_snapshots.rollout_id 
        AND c.created_by = auth.uid()
    )
);

-- Politiques pour les alertes - lecture pour les utilisateurs autorisés
CREATE POLICY "Authorized users can read rollout alerts" 
ON rollout_alerts FOR SELECT 
TO authenticated 
USING (
    auth.jwt() ->> 'role' IN ('admin', 'nutritionist') OR
    EXISTS (
        SELECT 1 FROM gradual_rollout_configs c 
        WHERE c.id = rollout_alerts.rollout_id 
        AND c.created_by = auth.uid()
    )
);

-- =====================================================
-- COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON TABLE gradual_rollout_configs IS 'Configuration des déploiements progressifs de feature flags';
COMMENT ON TABLE gradual_rollout_status IS 'Statut en temps réel des déploiements progressifs';
COMMENT ON TABLE rollout_metrics_snapshots IS 'Snapshots historiques des métriques pour analyse des performances';
COMMENT ON TABLE rollout_alerts IS 'Alertes et notifications pour les déploiements progressifs';

COMMENT ON VIEW active_rollouts_dashboard IS 'Vue dashboard pour le monitoring des déploiements actifs';
COMMENT ON VIEW rollout_performance_analysis IS 'Analyse des performances des déploiements sur 7 jours';

COMMENT ON FUNCTION calculate_rollout_performance IS 'Calcule les métriques de performance d\'un déploiement sur une période donnée';
COMMENT ON FUNCTION create_metrics_snapshot IS 'Crée un snapshot des métriques actuelles d\'un déploiement';
COMMENT ON FUNCTION trigger_rollout_alert IS 'Déclenche une alerte pour un déploiement progressif';
