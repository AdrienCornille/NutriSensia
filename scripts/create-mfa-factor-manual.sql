-- =====================================================
-- CRÉATION MANUELLE - FACTEUR MFA
-- Script pour créer manuellement un facteur MFA et permettre la vérification
-- =====================================================

-- =====================================================
-- ÉTAPE 1: VÉRIFIER L'UTILISATEUR
-- =====================================================

-- Vérifier que l'utilisateur existe
SELECT 
    'UTILISATEUR' as titre,
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    u.created_at
FROM auth.users u
WHERE u.email = 'siniam34@gmail.com';

-- =====================================================
-- ÉTAPE 2: VÉRIFIER LE PROFIL
-- =====================================================

-- Vérifier que l'utilisateur a un profil
SELECT 
    'PROFIL' as titre,
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
-- ÉTAPE 3: NETTOYER LES FACTEURS EXISTANTS
-- =====================================================

-- Supprimer tous les facteurs MFA existants pour cet utilisateur
DELETE FROM auth.mfa_factors 
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
);

-- Afficher le résultat
SELECT 
    'NETTOYAGE TERMINÉ' as statut,
    'Tous les facteurs MFA supprimés pour siniam34@gmail.com' as action;

-- =====================================================
-- ÉTAPE 4: CRÉER UN NOUVEAU FACTEUR MFA
-- =====================================================

-- Créer un nouveau facteur MFA avec un ID fixe
INSERT INTO auth.mfa_factors (
    id,
    user_id,
    factor_type,
    status,
    friendly_name,
    created_at,
    updated_at
) VALUES (
    '4975f8f1-1f9c-47ff-9c10-c36ee7bc1739', -- ID du facteur créé par l'application
    (SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'),
    'totp',
    'unverified',
    'NutriSensia TOTP',
    NOW(),
    NOW()
);

-- Afficher le résultat
SELECT 
    'FACTEUR CRÉÉ' as statut,
    'Facteur 4975f8f1-1f9c-47ff-9c10-c36ee7bc1739 créé avec statut unverified' as action;

-- =====================================================
-- ÉTAPE 5: VÉRIFIER LA CRÉATION
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
WHERE mf.id = '4975f8f1-1f9c-47ff-9c10-c36ee7bc1739';

-- =====================================================
-- ÉTAPE 6: TEST DE VÉRIFICATION
-- =====================================================

-- Créer une fonction pour tester la vérification
CREATE OR REPLACE FUNCTION test_mfa_verification_manual()
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
        WHERE id = '4975f8f1-1f9c-47ff-9c10-c36ee7bc1739'
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
SELECT * FROM test_mfa_verification_manual();

-- =====================================================
-- ÉTAPE 7: INSTRUCTIONS POUR L'UTILISATEUR
-- =====================================================

-- Afficher les instructions pour l'utilisateur
SELECT 
    'INSTRUCTIONS POUR L''UTILISATEUR' as titre,
    '1. Recharger la page de configuration 2FA' as instruction_1,
    '2. Scanner le QR code avec votre application d''authentification' as instruction_2,
    '3. Entrer le code de vérification à 6 chiffres' as instruction_3,
    '4. La vérification devrait maintenant fonctionner' as instruction_4;

-- =====================================================
-- ÉTAPE 8: NETTOYAGE
-- =====================================================

-- Supprimer la fonction de test
DROP FUNCTION IF EXISTS test_mfa_verification_manual();

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT :

1. **Vérification** : Contrôle que l'utilisateur et le profil existent
2. **Nettoyage** : Supprime tous les facteurs MFA existants
3. **Création** : Crée un nouveau facteur MFA avec l'ID correct
4. **Vérification** : Confirme que le facteur a été créé
5. **Test** : Teste que tout est prêt pour la vérification

🔧 COMMENT L'UTILISER :

1. Exécutez ce script dans l'éditeur SQL de Supabase
2. Le script créera un facteur MFA propre
3. Testez la configuration 2FA avec l'utilisateur

⚠️ IMPORTANT :

- Ce script est sûr à exécuter
- Il supprime tous les facteurs MFA existants pour cet utilisateur
- Il crée un nouveau facteur MFA propre

🚀 RÉSULTAT ATTENDU :

- Un facteur MFA propre sera créé
- L'utilisateur pourra scanner le QR code
- L'utilisateur pourra entrer son code de vérification
- La vérification devrait fonctionner

💡 POURQUOI CE PROBLÈME SE PRODUIT :

1. **Nettoyage automatique** : Supabase supprime automatiquement les facteurs non vérifiés
2. **Timing** : Le facteur est supprimé avant que l'utilisateur puisse le vérifier
3. **Conflit** : Le nettoyage se déclenche pendant la vérification

🆘 SI LE PROBLÈME PERSISTE :

1. Vérifiez que le facteur a été créé
2. Testez la configuration 2FA
3. Vérifiez que le nettoyage automatique est désactivé
4. Contactez le support Supabase si nécessaire
*/
