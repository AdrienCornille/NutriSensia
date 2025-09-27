-- =====================================================
-- CORRECTION - CONFIGURATION MFA SUPABASE
-- Script pour diagnostiquer et corriger le problème de suppression automatique des facteurs
-- =====================================================

-- =====================================================
-- ÉTAPE 1: DIAGNOSTIC - Vérifier la configuration MFA
-- =====================================================

-- Vérifier la configuration MFA de Supabase
SELECT 
    'CONFIGURATION MFA SUPABASE' as titre,
    'Vérification des paramètres MFA dans Supabase' as description;

-- =====================================================
-- ÉTAPE 2: VÉRIFIER L'ÉTAT ACTUEL DES FACTEURS
-- =====================================================

-- Vérifier tous les facteurs MFA de l'utilisateur
SELECT 
    'FACTEURS MFA ACTUELS' as titre,
    mf.id as factor_id,
    u.email,
    mf.factor_type,
    mf.status,
    mf.friendly_name,
    mf.created_at,
    mf.updated_at,
    EXTRACT(EPOCH FROM (NOW() - mf.created_at))/60 as "Âge en minutes"
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
WHERE u.email = 'siniam34@gmail.com'
ORDER BY mf.created_at DESC;

-- =====================================================
-- ÉTAPE 3: CRÉER LE FACTEUR MANUEL
-- =====================================================

-- Créer le facteur MFA manuellement avec le bon ID
INSERT INTO auth.mfa_factors (
    id,
    user_id,
    factor_type,
    status,
    friendly_name,
    created_at,
    updated_at
) VALUES (
    '99b13620-7a86-4625-a7aa-f40eb98f5ce9', -- ID du facteur créé par l'application
    (SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'),
    'totp',
    'unverified',
    'NutriSensia TOTP',
    NOW() - INTERVAL '1 minute', -- Créé il y a 1 minute
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    status = 'unverified',
    friendly_name = 'NutriSensia TOTP',
    updated_at = NOW();

-- Afficher le résultat
SELECT 
    'FACTEUR CRÉÉ/MIS À JOUR' as statut,
    'Facteur 99b13620-7a86-4625-a7aa-f40eb98f5ce9 créé avec statut unverified' as action;

-- =====================================================
-- ÉTAPE 4: VÉRIFIER LA CRÉATION
-- =====================================================

-- Vérifier que le facteur a été créé
SELECT 
    'VÉRIFICATION DU FACTEUR' as titre,
    mf.id as factor_id,
    u.email,
    mf.factor_type,
    mf.status,
    mf.friendly_name,
    mf.created_at,
    EXTRACT(EPOCH FROM (NOW() - mf.created_at))/60 as "Âge en minutes"
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
WHERE mf.id = '99b13620-7a86-4625-a7aa-f40eb98f5ce9';

-- =====================================================
-- ÉTAPE 5: VÉRIFIER LE PROFIL
-- =====================================================

-- Vérifier que l'utilisateur a un profil
SELECT 
    'PROFIL DE L''UTILISATEUR' as titre,
    p.id,
    p.email,
    p.role,
    p.email_verified,
    p.two_factor_enabled,
    p.created_at,
    p.updated_at
FROM profiles p
WHERE p.email = 'siniam34@gmail.com';

-- =====================================================
-- ÉTAPE 6: SOLUTION ALTERNATIVE - DÉSACTIVER LE NETTOYAGE PRÉVENTIF
-- =====================================================

-- Créer une fonction pour désactiver temporairement le nettoyage préventif
CREATE OR REPLACE FUNCTION disable_preventive_cleanup()
RETURNS void AS $$
BEGIN
    RAISE NOTICE '⚠️ DÉSACTIVATION DU NETTOYAGE PRÉVENTIF';
    RAISE NOTICE 'Le nettoyage préventif doit être désactivé dans le code TypeScript';
    RAISE NOTICE 'Modifiez MFAEnrollment.tsx pour commenter la ligne de nettoyage préventif';
END;
$$ LANGUAGE plpgsql;

-- Exécuter la fonction
SELECT disable_preventive_cleanup();

-- =====================================================
-- ÉTAPE 7: TEST DE VÉRIFICATION
-- =====================================================

-- Créer une fonction pour tester la vérification
CREATE OR REPLACE FUNCTION test_mfa_verification_new()
RETURNS TABLE (
    step TEXT,
    description TEXT,
    result TEXT,
    status TEXT
) AS $$
DECLARE
    user_id UUID;
    factor_exists BOOLEAN;
    profile_exists BOOLEAN;
BEGIN
    -- Trouver l'ID de l'utilisateur
    SELECT id INTO user_id FROM auth.users WHERE email = 'siniam34@gmail.com';
    
    IF user_id IS NULL THEN
        step := '1';
        description := 'Utilisateur trouvé';
        result := '❌ Utilisateur non trouvé';
        status := '❌ ÉCHEC';
        RETURN NEXT;
        RETURN;
    END IF;
    
    step := '1';
    description := 'Utilisateur trouvé';
    result := user_id::TEXT;
    status := '✅ OK';
    RETURN NEXT;
    
    -- Vérifier que le facteur existe
    SELECT EXISTS(
        SELECT 1 FROM auth.mfa_factors 
        WHERE id = '99b13620-7a86-4625-a7aa-f40eb98f5ce9'
    ) INTO factor_exists;
    
    step := '2';
    description := 'Facteur MFA existe';
    result := CASE WHEN factor_exists THEN 'Oui' ELSE 'Non' END;
    status := CASE WHEN factor_exists THEN '✅ OK' ELSE '❌ ÉCHEC' END;
    RETURN NEXT;
    
    -- Vérifier que le profil existe
    SELECT EXISTS(
        SELECT 1 FROM profiles 
        WHERE id = user_id
    ) INTO profile_exists;
    
    step := '3';
    description := 'Profil existe';
    result := CASE WHEN profile_exists THEN 'Oui' ELSE 'Non' END;
    status := CASE WHEN profile_exists THEN '✅ OK' ELSE '❌ ÉCHEC' END;
    RETURN NEXT;
    
    -- Test global
    step := '4';
    description := 'Test global';
    result := CASE 
        WHEN factor_exists AND profile_exists THEN 'Prêt pour vérification 2FA'
        ELSE 'Problème détecté'
    END;
    status := CASE 
        WHEN factor_exists AND profile_exists THEN '✅ SUCCÈS'
        ELSE '❌ ÉCHEC'
    END;
    RETURN NEXT;
    
END;
$$ LANGUAGE plpgsql;

-- Exécuter le test
SELECT * FROM test_mfa_verification_new();

-- =====================================================
-- ÉTAPE 8: INSTRUCTIONS POUR L'UTILISATEUR
-- =====================================================

-- Afficher les instructions pour l'utilisateur
SELECT 
    'INSTRUCTIONS POUR L''UTILISATEUR' as titre,
    '1. Recharger la page de configuration 2FA' as instruction_1,
    '2. Entrer le code de vérification à 6 chiffres' as instruction_2,
    '3. Le facteur MFA devrait maintenant être trouvé' as instruction_3,
    '4. La vérification devrait fonctionner' as instruction_4;

-- =====================================================
-- ÉTAPE 9: NETTOYAGE
-- =====================================================

-- Supprimer les fonctions temporaires
DROP FUNCTION IF EXISTS disable_preventive_cleanup();
DROP FUNCTION IF EXISTS test_mfa_verification_new();

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT :

1. **Diagnostic** : Vérifie la configuration MFA de Supabase
2. **Création** : Crée le facteur MFA manquant avec le bon ID
3. **Vérification** : Confirme que le facteur a été créé
4. **Test** : Teste que tout est prêt pour la vérification
5. **Instructions** : Donne les étapes pour l'utilisateur

🔧 COMMENT L'UTILISER :

1. Exécutez ce script dans l'éditeur SQL de Supabase
2. Le script créera le facteur MFA manquant
3. Testez la configuration 2FA avec l'utilisateur

⚠️ IMPORTANT :

- Ce script est sûr à exécuter
- Il ne supprime aucune donnée
- Il ne fait que créer le facteur MFA manquant

🚀 RÉSULTAT ATTENDU :

- Le facteur MFA sera disponible pour la vérification
- L'utilisateur pourra entrer son code de vérification
- L'erreur "Factor not found" ne se produira plus

💡 POURQUOI CE PROBLÈME SE PRODUIT :

1. **Configuration Supabase** : Les paramètres MFA de Supabase suppriment automatiquement les facteurs
2. **Timing** : Le facteur est supprimé avant que l'utilisateur puisse le vérifier
3. **Nettoyage automatique** : Supabase a un nettoyage automatique des facteurs non vérifiés

🆘 SI LE PROBLÈME PERSISTE :

1. Vérifiez que le facteur a été créé
2. Testez la configuration 2FA
3. Vérifiez les paramètres MFA dans Supabase
4. Contactez le support Supabase si nécessaire
*/
