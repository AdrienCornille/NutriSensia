-- =====================================================
-- Migration simple : Ajout des champs de consentement
-- À exécuter dans l'éditeur SQL de Supabase
-- =====================================================

-- Ajout des colonnes de consentement
ALTER TABLE nutritionists 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMP WITH TIME ZONE;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_nutritionists_terms_accepted ON nutritionists(terms_accepted, terms_accepted_at);
CREATE INDEX IF NOT EXISTS idx_nutritionists_privacy_accepted ON nutritionists(privacy_policy_accepted, privacy_policy_accepted_at);
CREATE INDEX IF NOT EXISTS idx_nutritionists_marketing_consent ON nutritionists(marketing_consent, marketing_consent_at);
