-- ============================================================================
-- 18. Login Attempts - Rate Limiting pour AUTH-002
-- ============================================================================
-- Cette table permet de tracker les tentatives de connexion échouées
-- et de bloquer temporairement après 5 échecs consécutifs
-- ============================================================================

-- Supprimer la table si elle existe (pour réinitialisation)
DROP TABLE IF EXISTS login_attempts;

-- Table pour tracker les tentatives de connexion
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    success BOOLEAN NOT NULL DEFAULT FALSE,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les recherches par email et date (utilisé pour compter les tentatives)
CREATE INDEX idx_login_attempts_email_attempted
ON login_attempts(email, attempted_at DESC);

-- Index pour les recherches par succès (pour filtrer les échecs)
CREATE INDEX idx_login_attempts_email_success
ON login_attempts(email, success, attempted_at DESC);

-- Index pour le nettoyage des anciennes entrées
CREATE INDEX idx_login_attempts_attempted_at
ON login_attempts(attempted_at);

-- Commentaires
COMMENT ON TABLE login_attempts IS 'Suivi des tentatives de connexion pour le rate limiting (AUTH-002)';
COMMENT ON COLUMN login_attempts.email IS 'Email utilisé pour la tentative (en minuscules)';
COMMENT ON COLUMN login_attempts.ip_address IS 'Adresse IP du client';
COMMENT ON COLUMN login_attempts.user_agent IS 'User-Agent du navigateur';
COMMENT ON COLUMN login_attempts.attempted_at IS 'Date/heure de la tentative';
COMMENT ON COLUMN login_attempts.success IS 'True si connexion réussie, False sinon';
COMMENT ON COLUMN login_attempts.failure_reason IS 'Raison de l echec (invalid_credentials, email_not_confirmed, etc.)';

-- ============================================================================
-- Row Level Security
-- ============================================================================
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Politique pour le service_role (accès complet via l'API backend)
-- Le service_role bypass RLS par défaut, mais on ajoute une politique explicite
CREATE POLICY "Service role full access" ON login_attempts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Aucune politique pour anon ou authenticated - ils ne peuvent pas accéder directement

-- ============================================================================
-- Vérification
-- ============================================================================
-- Afficher la structure de la table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'login_attempts'
ORDER BY ordinal_position;
