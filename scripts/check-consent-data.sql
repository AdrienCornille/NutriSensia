-- =====================================================
-- Script de vérification des données de consentement
-- À exécuter dans l'éditeur SQL de Supabase
-- =====================================================

-- Vérifier les consentements des nutritionnistes
SELECT 
    id,
    first_name,
    last_name,
    terms_accepted,
    terms_accepted_at,
    privacy_policy_accepted,
    privacy_policy_accepted_at,
    marketing_consent,
    marketing_consent_at,
    updated_at
FROM nutritionists 
WHERE 
    terms_accepted IS NOT NULL 
    OR privacy_policy_accepted IS NOT NULL 
    OR marketing_consent IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

-- Statistiques des consentements
SELECT 
    COUNT(*) as total_nutritionists,
    COUNT(CASE WHEN terms_accepted = true THEN 1 END) as terms_accepted_count,
    COUNT(CASE WHEN privacy_policy_accepted = true THEN 1 END) as privacy_accepted_count,
    COUNT(CASE WHEN marketing_consent = true THEN 1 END) as marketing_consent_count,
    COUNT(CASE WHEN terms_accepted_at IS NOT NULL THEN 1 END) as terms_timestamps,
    COUNT(CASE WHEN privacy_policy_accepted_at IS NOT NULL THEN 1 END) as privacy_timestamps,
    COUNT(CASE WHEN marketing_consent_at IS NOT NULL THEN 1 END) as marketing_timestamps
FROM nutritionists;


