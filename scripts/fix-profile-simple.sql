-- =====================================================
-- SCRIPT SIMPLIFIÉ POUR CORRIGER LES INCOHÉRENCES
-- =====================================================

-- Correction spécifique pour l'utilisateur Lucie
UPDATE profiles 
SET 
    email_verified = TRUE,
    two_factor_enabled = TRUE,
    updated_at = NOW()
WHERE id = 'e2143066-6067-4af5-90d3-beca62b46f76';

-- Vérifier la correction
SELECT 
    id,
    email,
    full_name,
    role,
    email_verified,
    two_factor_enabled,
    updated_at
FROM profiles 
WHERE id = 'e2143066-6067-4af5-90d3-beca62b46f76';

-- Afficher tous les profils pour vérification
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.email_verified,
    p.two_factor_enabled,
    p.updated_at
FROM profiles p
ORDER BY p.updated_at DESC;

-- Test d'accès au profil
SELECT 
    'Test accès profil' as test_name,
    CASE 
        WHEN EXISTS(SELECT 1 FROM profiles WHERE id = 'e2143066-6067-4af5-90d3-beca62b46f76') 
        THEN '✅ Profil accessible' 
        ELSE '❌ Profil non trouvé' 
    END as result;
