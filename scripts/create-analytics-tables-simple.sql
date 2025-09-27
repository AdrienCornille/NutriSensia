-- Script SQL simplifié pour créer les tables d'analytics d'onboarding
-- À exécuter dans l'interface Supabase (SQL Editor)

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

-- Politiques RLS (Row Level Security)
ALTER TABLE onboarding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

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

-- Commentaires pour la documentation
COMMENT ON TABLE onboarding_events IS 'Stocke tous les événements d''onboarding pour l''analyse';
COMMENT ON TABLE onboarding_sessions IS 'Suit les sessions d''onboarding des utilisateurs';
