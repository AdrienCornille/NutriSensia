-- Migration SQL pour les tables de formulaires de contact NutriSensia
-- À exécuter dans l'éditeur SQL de Supabase

-- =============================================
-- Table principale pour toutes les soumissions de contact
-- =============================================
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Métadonnées de la soumission
    form_type VARCHAR(50) NOT NULL CHECK (form_type IN ('general', 'patient', 'nutritionist', 'demo')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'spam')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    
    -- Informations de base (communes à tous les formulaires)
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT,
    
    -- Champ honeypot pour la détection de spam
    website VARCHAR(255) DEFAULT NULL,
    
    -- Consentement RGPD
    consent BOOLEAN NOT NULL DEFAULT false,
    
    -- Données spécifiques au formulaire (stockées en JSONB pour flexibilité)
    form_data JSONB NOT NULL DEFAULT '{}',
    
    -- Métadonnées techniques
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Assignation et suivi
    assigned_to UUID REFERENCES auth.users(id),
    internal_notes TEXT,
    
    -- Index pour les recherches
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('french', coalesce(name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(message, ''))
    ) STORED
);

-- =============================================
-- Table pour le suivi des tentatives de spam
-- =============================================
CREATE TABLE IF NOT EXISTS spam_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL,
    email VARCHAR(255),
    attempt_count INTEGER DEFAULT 1,
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table pour les réponses automatiques
-- =============================================
CREATE TABLE IF NOT EXISTS contact_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES contact_submissions(id) ON DELETE CASCADE,
    response_type VARCHAR(20) NOT NULL CHECK (response_type IN ('auto_reply', 'manual_reply', 'follow_up')),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_by UUID REFERENCES auth.users(id),
    email_status VARCHAR(20) DEFAULT 'sent' CHECK (email_status IN ('sent', 'delivered', 'bounced', 'failed'))
);

-- =============================================
-- Index pour optimiser les performances
-- =============================================
CREATE INDEX IF NOT EXISTS idx_contact_submissions_form_type ON contact_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_search ON contact_submissions USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_spam_attempts_ip ON spam_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_spam_attempts_email ON spam_attempts(email);

-- =============================================
-- Fonction pour mettre à jour le timestamp updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Fonction pour détecter et gérer le spam
-- =============================================
CREATE OR REPLACE FUNCTION check_spam_attempt(
    p_ip_address INET,
    p_email VARCHAR(255) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    attempt_record spam_attempts%ROWTYPE;
    max_attempts INTEGER := 5;
    block_duration INTERVAL := '1 hour';
BEGIN
    -- Vérifier les tentatives existantes pour cette IP
    SELECT * INTO attempt_record 
    FROM spam_attempts 
    WHERE ip_address = p_ip_address 
    AND (blocked_until IS NULL OR blocked_until > NOW());
    
    IF FOUND THEN
        -- Si déjà bloqué, retourner true (spam détecté)
        IF attempt_record.blocked_until IS NOT NULL AND attempt_record.blocked_until > NOW() THEN
            RETURN TRUE;
        END IF;
        
        -- Incrémenter le compteur
        UPDATE spam_attempts 
        SET attempt_count = attempt_count + 1,
            last_attempt = NOW(),
            blocked_until = CASE 
                WHEN attempt_count + 1 >= max_attempts THEN NOW() + block_duration
                ELSE NULL
            END
        WHERE ip_address = p_ip_address;
        
        -- Vérifier si on doit bloquer
        IF attempt_record.attempt_count + 1 >= max_attempts THEN
            RETURN TRUE;
        END IF;
    ELSE
        -- Première tentative pour cette IP
        INSERT INTO spam_attempts (ip_address, email, attempt_count, last_attempt)
        VALUES (p_ip_address, p_email, 1, NOW());
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Fonction pour nettoyer les anciens enregistrements de spam
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_old_spam_attempts()
RETURNS void AS $$
BEGIN
    DELETE FROM spam_attempts 
    WHERE created_at < NOW() - INTERVAL '7 days'
    AND (blocked_until IS NULL OR blocked_until < NOW());
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Politiques RLS (Row Level Security)
-- =============================================
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_responses ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion publique (pour les formulaires de contact)
CREATE POLICY "Allow public insert on contact_submissions" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre la lecture aux utilisateurs authentifiés (admin/staff)
CREATE POLICY "Allow authenticated read on contact_submissions" ON contact_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'staff')
        )
    );

-- Politique pour permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated update on contact_submissions" ON contact_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'staff')
        )
    );

-- Politiques pour spam_attempts (lecture seule pour les admins)
CREATE POLICY "Allow admin read on spam_attempts" ON spam_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Politiques pour contact_responses
CREATE POLICY "Allow authenticated all on contact_responses" ON contact_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'staff')
        )
    );

-- =============================================
-- Vues utiles pour l'administration
-- =============================================

-- Vue pour les statistiques de contact
CREATE OR REPLACE VIEW contact_stats AS
SELECT 
    form_type,
    status,
    COUNT(*) as count,
    DATE_TRUNC('day', created_at) as date
FROM contact_submissions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY form_type, status, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Vue pour les soumissions récentes avec priorité
CREATE OR REPLACE VIEW recent_submissions AS
SELECT 
    id,
    form_type,
    name,
    email,
    status,
    priority,
    created_at,
    CASE 
        WHEN status = 'pending' AND priority = 'high' THEN 1
        WHEN status = 'pending' AND priority = 'medium' THEN 2
        WHEN status = 'pending' AND priority = 'low' THEN 3
        WHEN status = 'in_progress' THEN 4
        ELSE 5
    END as sort_order
FROM contact_submissions
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY sort_order, created_at DESC;

-- =============================================
-- Données de test (optionnel - à supprimer en production)
-- =============================================
/*
INSERT INTO contact_submissions (form_type, name, email, phone, message, form_data, consent) VALUES
('general', 'Jean Dupont', 'jean.dupont@example.com', '+41 79 123 45 67', 'Demande d''information sur vos services', '{"subject": "Information", "category": "information"}', true),
('patient', 'Marie Martin', 'marie.martin@example.com', '+41 78 987 65 43', 'Je souhaiterais une consultation nutritionnelle', '{"consultationType": "first-consultation", "urgency": "medium", "age": 35}', true),
('nutritionist', 'Dr. Sophie Leroy', 'sophie.leroy@example.com', '+41 76 555 44 33', 'Candidature pour rejoindre votre plateforme', '{"professionalTitle": "Diététicienne diplômée", "yearsExperience": 8, "credentials": ["asca", "sge"]}', true);
*/

-- =============================================
-- Commentaires sur les tables
-- =============================================
COMMENT ON TABLE contact_submissions IS 'Table principale pour stocker toutes les soumissions de formulaires de contact';
COMMENT ON COLUMN contact_submissions.form_type IS 'Type de formulaire: general, patient, nutritionist, demo';
COMMENT ON COLUMN contact_submissions.form_data IS 'Données spécifiques au formulaire stockées en JSON';
COMMENT ON COLUMN contact_submissions.website IS 'Champ honeypot - doit rester vide pour les soumissions légitimes';
COMMENT ON COLUMN contact_submissions.search_vector IS 'Vecteur de recherche généré automatiquement pour la recherche full-text';

COMMENT ON TABLE spam_attempts IS 'Table pour tracker les tentatives de spam et implémenter le rate limiting';
COMMENT ON TABLE contact_responses IS 'Table pour stocker les réponses envoyées aux soumissions de contact';

-- =============================================
-- Finalisation
-- =============================================
-- Créer un utilisateur de service pour l'API (optionnel)
-- CREATE USER contact_api_user WITH PASSWORD 'your_secure_password';
-- GRANT SELECT, INSERT ON contact_submissions TO contact_api_user;
-- GRANT EXECUTE ON FUNCTION check_spam_attempt TO contact_api_user;
