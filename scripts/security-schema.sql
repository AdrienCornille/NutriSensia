-- Script SQL pour créer les tables de sécurité et les fonctions associées
-- À exécuter dans Supabase SQL Editor

-- Table pour les événements de sécurité
CREATE TABLE IF NOT EXISTS security_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'login_attempt', 'login_success', 'login_failure', 'logout',
        'mfa_attempt', 'mfa_success', 'mfa_failure',
        'suspicious_activity', 'rate_limit_exceeded',
        'password_reset', 'account_locked'
    )),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    location JSONB DEFAULT '{}'
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_composite ON security_events(event_type, severity, timestamp DESC);

-- Table pour le rate limiting (optionnel, peut aussi utiliser Redis)
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key_identifier TEXT NOT NULL UNIQUE,
    attempt_count INTEGER DEFAULT 0,
    first_attempt TIMESTAMPTZ DEFAULT NOW(),
    blocked_until TIMESTAMPTZ,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key_identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked_until ON rate_limits(blocked_until);

-- Table pour les sessions suspectes
CREATE TABLE IF NOT EXISTS suspicious_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    flags JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'blocked'))
);

CREATE INDEX IF NOT EXISTS idx_suspicious_sessions_user_id ON suspicious_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_sessions_status ON suspicious_sessions(status);
CREATE INDEX IF NOT EXISTS idx_suspicious_sessions_risk_score ON suspicious_sessions(risk_score DESC);

-- Fonction pour obtenir les événements par type
CREATE OR REPLACE FUNCTION get_events_by_type(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS TABLE(event_type TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        se.event_type,
        COUNT(*) as count
    FROM security_events se
    WHERE se.timestamp >= start_date AND se.timestamp <= end_date
    GROUP BY se.event_type
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les événements par sévérité
CREATE OR REPLACE FUNCTION get_events_by_severity(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS TABLE(severity TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        se.severity,
        COUNT(*) as count
    FROM security_events se
    WHERE se.timestamp >= start_date AND se.timestamp <= end_date
    GROUP BY se.severity
    ORDER BY 
        CASE se.severity
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les top IPs suspectes
CREATE OR REPLACE FUNCTION get_top_suspicious_ips(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(ip_address INET, event_count BIGINT, severity_score NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        se.ip_address,
        COUNT(*) as event_count,
        AVG(
            CASE se.severity
                WHEN 'critical' THEN 4
                WHEN 'high' THEN 3
                WHEN 'medium' THEN 2
                WHEN 'low' THEN 1
            END
        ) as severity_score
    FROM security_events se
    WHERE se.timestamp >= start_date AND se.timestamp <= end_date
    GROUP BY se.ip_address
    HAVING COUNT(*) > 1
    ORDER BY severity_score DESC, event_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les anciens événements (à exécuter périodiquement)
CREATE OR REPLACE FUNCTION cleanup_old_security_events(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM security_events 
    WHERE timestamp < NOW() - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Nettoyer aussi les rate limits expirés
    DELETE FROM rate_limits 
    WHERE blocked_until IS NOT NULL AND blocked_until < NOW()
    AND last_updated < NOW() - INTERVAL '24 hours';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour détecter les anomalies de connexion
CREATE OR REPLACE FUNCTION detect_login_anomalies(user_id_param UUID, ip_address_param INET)
RETURNS JSONB AS $$
DECLARE
    recent_ips INET[];
    failed_attempts INTEGER;
    anomaly_flags JSONB := '[]';
BEGIN
    -- Récupérer les IPs récentes de l'utilisateur (30 derniers jours)
    SELECT ARRAY_AGG(DISTINCT ip_address) INTO recent_ips
    FROM security_events
    WHERE user_id = user_id_param
    AND event_type = 'login_success'
    AND timestamp > NOW() - INTERVAL '30 days';
    
    -- Vérifier si l'IP est nouvelle
    IF recent_ips IS NULL OR NOT (ip_address_param = ANY(recent_ips)) THEN
        anomaly_flags := anomaly_flags || '["new_ip"]';
    END IF;
    
    -- Compter les tentatives échouées récentes
    SELECT COUNT(*) INTO failed_attempts
    FROM security_events
    WHERE ip_address = ip_address_param
    AND event_type = 'login_failure'
    AND timestamp > NOW() - INTERVAL '1 hour';
    
    IF failed_attempts > 3 THEN
        anomaly_flags := anomaly_flags || '["multiple_failures"]';
    END IF;
    
    -- Vérifier les connexions simultanées depuis différentes IPs
    IF EXISTS (
        SELECT 1 FROM security_events
        WHERE user_id = user_id_param
        AND event_type = 'login_success'
        AND ip_address != ip_address_param
        AND timestamp > NOW() - INTERVAL '10 minutes'
    ) THEN
        anomaly_flags := anomaly_flags || '["concurrent_sessions"]';
    END IF;
    
    RETURN jsonb_build_object(
        'anomalies', anomaly_flags,
        'risk_score', jsonb_array_length(anomaly_flags) * 25
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politique de sécurité Row Level Security (RLS)
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Politique pour les administrateurs
CREATE POLICY "Admins can view all security events" ON security_events
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Politique pour les utilisateurs normaux (ils peuvent voir leurs propres événements)
CREATE POLICY "Users can view their own security events" ON security_events
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Politique pour l'insertion (service role seulement)
CREATE POLICY "Service role can insert security events" ON security_events
    FOR INSERT TO service_role
    WITH CHECK (true);

-- RLS pour les sessions suspectes
ALTER TABLE suspicious_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage suspicious sessions" ON suspicious_sessions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS pour rate limits (admin seulement)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage rate limits" ON rate_limits
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Vue pour les statistiques de sécurité (accessible aux admins)
CREATE OR REPLACE VIEW security_dashboard_stats AS
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    event_type,
    severity,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT ip_address) as unique_ips
FROM security_events
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp), event_type, severity
ORDER BY hour DESC;

-- Grants pour la vue
GRANT SELECT ON security_dashboard_stats TO authenticated;

-- Trigger pour nettoyer automatiquement les anciens événements
CREATE OR REPLACE FUNCTION trigger_cleanup_security_events()
RETURNS TRIGGER AS $$
BEGIN
    -- Nettoyer une fois par jour (quand il y a de nouveaux événements)
    IF random() < 0.001 THEN -- 0.1% de chance à chaque insertion
        PERFORM cleanup_old_security_events(90);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_security_events_trigger
    AFTER INSERT ON security_events
    FOR EACH ROW
    EXECUTE FUNCTION trigger_cleanup_security_events();

-- Commentaires pour la documentation
COMMENT ON TABLE security_events IS 'Table pour stocker tous les événements de sécurité de l''application';
COMMENT ON TABLE rate_limits IS 'Table pour gérer le rate limiting par clé (IP, utilisateur, etc.)';
COMMENT ON TABLE suspicious_sessions IS 'Table pour traquer les sessions suspectes et les analyser';
COMMENT ON FUNCTION get_events_by_type IS 'Fonction pour obtenir les statistiques d''événements par type';
COMMENT ON FUNCTION get_events_by_severity IS 'Fonction pour obtenir les statistiques d''événements par sévérité';
COMMENT ON FUNCTION detect_login_anomalies IS 'Fonction pour détecter les anomalies lors des connexions utilisateur';

-- Insertion de données de test (optionnel, pour le développement)
INSERT INTO security_events (event_type, ip_address, user_agent, severity, metadata)
VALUES 
    ('login_success', '192.168.1.100', 'Mozilla/5.0 Test', 'low', '{"test": true}'),
    ('suspicious_activity', '10.0.0.1', 'curl/7.68.0', 'high', '{"reasons": ["suspicious_user_agent"]}')
ON CONFLICT DO NOTHING;
