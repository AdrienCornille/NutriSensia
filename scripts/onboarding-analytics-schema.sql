-- Schéma de base de données pour les analytics d'onboarding
-- Ce fichier crée les tables nécessaires pour stocker et analyser les données d'onboarding

-- Table principale pour les événements d'onboarding
CREATE TABLE IF NOT EXISTS onboarding_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('nutritionist', 'patient', 'admin')),
    step VARCHAR(100),
    step_number INTEGER,
    total_steps INTEGER,
    completion_percentage DECIMAL(5,2),
    time_spent INTEGER, -- en millisecondes
    device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    browser VARCHAR(50),
    error_type VARCHAR(50),
    error_message TEXT,
    help_type VARCHAR(50),
    help_requested BOOLEAN DEFAULT FALSE,
    skipped BOOLEAN DEFAULT FALSE,
    reason TEXT,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_onboarding_events_user_id ON onboarding_events(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_session_id ON onboarding_events(session_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_event_type ON onboarding_events(event_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_role ON onboarding_events(role);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_step ON onboarding_events(step);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_created_at ON onboarding_events(created_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_properties ON onboarding_events USING GIN(properties);

-- Table pour les sessions d'onboarding
CREATE TABLE IF NOT EXISTS onboarding_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('nutritionist', 'patient', 'admin')),
    device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    browser VARCHAR(50),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    abandoned_at TIMESTAMP WITH TIME ZONE,
    last_step VARCHAR(100),
    total_steps INTEGER,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    total_time_spent INTEGER, -- en millisecondes
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les sessions
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user_id ON onboarding_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_session_id ON onboarding_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_role ON onboarding_sessions(role);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_status ON onboarding_sessions(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_started_at ON onboarding_sessions(started_at);

-- Table pour les métriques d'onboarding (agrégées)
CREATE TABLE IF NOT EXISTS onboarding_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('nutritionist', 'patient', 'admin')),
    step VARCHAR(100),
    step_number INTEGER,
    total_users INTEGER DEFAULT 0,
    completed_users INTEGER DEFAULT 0,
    skipped_users INTEGER DEFAULT 0,
    abandoned_users INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    help_requests INTEGER DEFAULT 0,
    average_time_spent INTEGER DEFAULT 0, -- en millisecondes
    completion_rate DECIMAL(5,2) DEFAULT 0,
    drop_off_rate DECIMAL(5,2) DEFAULT 0,
    error_rate DECIMAL(5,2) DEFAULT 0,
    help_request_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, role, step)
);

-- Index pour les métriques
CREATE INDEX IF NOT EXISTS idx_onboarding_metrics_date ON onboarding_metrics(date);
CREATE INDEX IF NOT EXISTS idx_onboarding_metrics_role ON onboarding_metrics(role);
CREATE INDEX IF NOT EXISTS idx_onboarding_metrics_step ON onboarding_metrics(step);

-- Table pour les alertes d'onboarding
CREATE TABLE IF NOT EXISTS onboarding_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('drop_off', 'error_rate', 'completion_rate', 'help_requests')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    step VARCHAR(100),
    threshold DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les alertes
CREATE INDEX IF NOT EXISTS idx_onboarding_alerts_type ON onboarding_alerts(type);
CREATE INDEX IF NOT EXISTS idx_onboarding_alerts_severity ON onboarding_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_onboarding_alerts_is_active ON onboarding_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_onboarding_alerts_triggered_at ON onboarding_alerts(triggered_at);

-- Table pour les tests A/B d'onboarding
CREATE TABLE IF NOT EXISTS onboarding_ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
    target_role VARCHAR(50) CHECK (target_role IN ('nutritionist', 'patient', 'admin')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    configuration JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les variants des tests A/B
CREATE TABLE IF NOT EXISTS onboarding_ab_test_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES onboarding_ab_tests(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    traffic_allocation DECIMAL(5,2) NOT NULL CHECK (traffic_allocation >= 0 AND traffic_allocation <= 100),
    configuration JSONB DEFAULT '{}',
    results JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les assignations des utilisateurs aux tests A/B
CREATE TABLE IF NOT EXISTS onboarding_ab_test_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES onboarding_ab_tests(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES onboarding_ab_test_variants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(test_id, user_id, session_id)
);

-- Index pour les tests A/B
CREATE INDEX IF NOT EXISTS idx_onboarding_ab_tests_status ON onboarding_ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_ab_tests_target_role ON onboarding_ab_tests(target_role);
CREATE INDEX IF NOT EXISTS idx_onboarding_ab_test_assignments_user_id ON onboarding_ab_test_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_ab_test_assignments_session_id ON onboarding_ab_test_assignments(session_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_onboarding_events_updated_at 
    BEFORE UPDATE ON onboarding_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_sessions_updated_at 
    BEFORE UPDATE ON onboarding_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_metrics_updated_at 
    BEFORE UPDATE ON onboarding_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_alerts_updated_at 
    BEFORE UPDATE ON onboarding_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_ab_tests_updated_at 
    BEFORE UPDATE ON onboarding_ab_tests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_ab_test_variants_updated_at 
    BEFORE UPDATE ON onboarding_ab_test_variants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vue pour les métriques d'onboarding en temps réel
CREATE OR REPLACE VIEW onboarding_metrics_realtime AS
SELECT 
    DATE(oe.created_at) as date,
    oe.role,
    oe.step,
    oe.step_number,
    COUNT(DISTINCT oe.user_id) as total_users,
    COUNT(DISTINCT CASE WHEN oe.event_type = 'Onboarding Step Completed' THEN oe.user_id END) as completed_users,
    COUNT(DISTINCT CASE WHEN oe.event_type = 'Onboarding Step Skipped' THEN oe.user_id END) as skipped_users,
    COUNT(DISTINCT CASE WHEN oe.event_type = 'Onboarding Abandoned' THEN oe.user_id END) as abandoned_users,
    COUNT(CASE WHEN oe.event_type = 'Onboarding Step Error' THEN 1 END) as error_count,
    COUNT(CASE WHEN oe.event_type = 'Onboarding Help Requested' THEN 1 END) as help_requests,
    AVG(CASE WHEN oe.event_type = 'Onboarding Step Completed' THEN oe.time_spent END) as average_time_spent,
    ROUND(
        COUNT(DISTINCT CASE WHEN oe.event_type = 'Onboarding Step Completed' THEN oe.user_id END) * 100.0 / 
        NULLIF(COUNT(DISTINCT oe.user_id), 0), 2
    ) as completion_rate,
    ROUND(
        COUNT(DISTINCT CASE WHEN oe.event_type = 'Onboarding Abandoned' THEN oe.user_id END) * 100.0 / 
        NULLIF(COUNT(DISTINCT oe.user_id), 0), 2
    ) as drop_off_rate,
    ROUND(
        COUNT(CASE WHEN oe.event_type = 'Onboarding Step Error' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(*), 0), 2
    ) as error_rate,
    ROUND(
        COUNT(CASE WHEN oe.event_type = 'Onboarding Help Requested' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(DISTINCT oe.user_id), 0), 2
    ) as help_request_rate
FROM onboarding_events oe
WHERE oe.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(oe.created_at), oe.role, oe.step, oe.step_number;

-- Vue pour le funnel d'onboarding
CREATE OR REPLACE VIEW onboarding_funnel AS
WITH step_events AS (
    SELECT 
        oe.role,
        oe.step,
        oe.step_number,
        oe.total_steps,
        COUNT(DISTINCT oe.session_id) as sessions_entered,
        COUNT(DISTINCT CASE WHEN oe.event_type = 'Onboarding Step Completed' THEN oe.session_id END) as sessions_completed,
        AVG(CASE WHEN oe.event_type = 'Onboarding Step Completed' THEN oe.time_spent END) as average_time_spent
    FROM onboarding_events oe
    WHERE oe.created_at >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY oe.role, oe.step, oe.step_number, oe.total_steps
)
SELECT 
    role,
    step,
    step_number,
    total_steps,
    sessions_entered,
    sessions_completed,
    ROUND(sessions_completed * 100.0 / NULLIF(sessions_entered, 0), 2) as completion_rate,
    ROUND((sessions_entered - sessions_completed) * 100.0 / NULLIF(sessions_entered, 0), 2) as drop_off_rate,
    COALESCE(average_time_spent, 0) as average_time_spent
FROM step_events
ORDER BY role, step_number;

-- Politiques RLS (Row Level Security)
ALTER TABLE onboarding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_ab_test_assignments ENABLE ROW LEVEL SECURITY;

-- Politique pour les événements d'onboarding (lecture pour les admins, écriture pour tous les utilisateurs authentifiés)
CREATE POLICY "Users can insert their own onboarding events" ON onboarding_events
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

CREATE POLICY "Admins can view all onboarding events" ON onboarding_events
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- Politique pour les sessions d'onboarding
CREATE POLICY "Users can insert their own onboarding sessions" ON onboarding_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

CREATE POLICY "Admins can view all onboarding sessions" ON onboarding_sessions
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- Politique pour les métriques (lecture pour les admins uniquement)
CREATE POLICY "Admins can view onboarding metrics" ON onboarding_metrics
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- Politique pour les alertes (lecture pour les admins uniquement)
CREATE POLICY "Admins can view onboarding alerts" ON onboarding_alerts
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- Politique pour les tests A/B (lecture pour les admins uniquement)
CREATE POLICY "Admins can manage onboarding AB tests" ON onboarding_ab_tests
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

CREATE POLICY "Admins can manage onboarding AB test variants" ON onboarding_ab_test_variants
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

CREATE POLICY "Users can view their own AB test assignments" ON onboarding_ab_test_assignments
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- Commentaires pour la documentation
COMMENT ON TABLE onboarding_events IS 'Stocke tous les événements d''onboarding pour l''analyse';
COMMENT ON TABLE onboarding_sessions IS 'Suit les sessions d''onboarding des utilisateurs';
COMMENT ON TABLE onboarding_metrics IS 'Métriques agrégées d''onboarding par jour/rôle/étape';
COMMENT ON TABLE onboarding_alerts IS 'Alertes automatiques basées sur les métriques d''onboarding';
COMMENT ON TABLE onboarding_ab_tests IS 'Tests A/B pour optimiser l''onboarding';
COMMENT ON TABLE onboarding_ab_test_variants IS 'Variants des tests A/B d''onboarding';
COMMENT ON TABLE onboarding_ab_test_assignments IS 'Assignations des utilisateurs aux variants des tests A/B';
