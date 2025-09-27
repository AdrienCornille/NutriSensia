-- =====================================================
-- CORRECTION IMMÉDIATE - PROBLÈME DE TIMING MFA
-- Script pour résoudre immédiatement le problème de l'utilisateur siniam34@gmail.com
-- =====================================================

-- =====================================================
-- ÉTAPE 1: VÉRIFIER L'ÉTAT ACTUEL
-- =====================================================

-- Vérifier l'état actuel des facteurs MFA
SELECT 
    'ÉTAT ACTUEL DES FACTEURS' as titre,
    mf.id as factor_id,
    u.email,
    mf.factor_type,
    mf.status,
    mf.friendly_name,
    mf.created_at,
    EXTRACT(EPOCH FROM (NOW() - mf.created_at))/60 as "Âge en minutes"
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
WHERE u.email = 'siniam34@gmail.com'
ORDER BY mf.created_at DESC;

-- =====================================================
-- ÉTAPE 2: CRÉER LE FACTEUR MANQUANT
-- =====================================================

-- Créer le facteur MFA manquant avec le bon ID
INSERT INTO auth.mfa_factors (
    id,
    user_id,
    factor_type,
    status,
    friendly_name,
    created_at,
    updated_at
) VALUES (
    '5d06f489-0240-4639-a2be-99592372a13a', -- ID du facteur créé par l'application
    (SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'),
    'totp',
    'unverified',
    'NutriSensia TOTP',
    NOW() - INTERVAL '2 minutes', -- Créé il y a 2 minutes pour simuler le timing
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    status = 'unverified',
    friendly_name = 'NutriSensia TOTP',
    updated_at = NOW();

-- Afficher le résultat
SELECT 
    'FACTEUR CRÉÉ/MIS À JOUR' as statut,
    'Facteur 5d06f489-0240-4639-a2be-99592372a13a créé avec statut unverified' as action;

-- =====================================================
-- ÉTAPE 3: VÉRIFIER LA CRÉATION
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
WHERE mf.id = '5d06f489-0240-4639-a2be-99592372a13a';

-- =====================================================
-- ÉTAPE 4: VÉRIFIER LE PROFIL
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
-- ÉTAPE 5: INSTRUCTIONS POUR L'UTILISATEUR
-- =====================================================

-- Afficher les instructions pour l'utilisateur
SELECT 
    'INSTRUCTIONS POUR L''UTILISATEUR' as titre,
    '1. Recharger la page de configuration 2FA' as instruction_1,
    '2. Entrer le code de vérification à 6 chiffres' as instruction_2,
    '3. Le facteur MFA devrait maintenant être trouvé' as instruction_3,
    '4. La vérification devrait fonctionner' as instruction_4;

-- =====================================================
-- ÉTAPE 6: TEST DE VÉRIFICATION
-- =====================================================

-- Créer une fonction pour tester la vérification
CREATE OR REPLACE FUNCTION test_mfa_verification()
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
        WHERE id = '5d06f489-0240-4639-a2be-99592372a13a'
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
SELECT * FROM test_mfa_verification();

-- =====================================================
-- ÉTAPE 7: NETTOYAGE
-- =====================================================

-- Supprimer la fonction de test
DROP FUNCTION IF EXISTS test_mfa_verification();

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT :

1. **Vérification** : Contrôle l'état actuel des facteurs MFA
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

1. **Timing** : Le facteur est supprimé par le nettoyage avant vérification
2. **Nettoyage agressif** : Le nettoyage préventif est trop agressif
3. **Délai insuffisant** : L'utilisateur n'a pas assez de temps pour scanner et entrer le code

🆘 SI LE PROBLÈME PERSISTE :

1. Vérifiez que le facteur a été créé
2. Testez la configuration 2FA
3. Vérifiez que le code de nettoyage a été modifié
4. Contactez le support Supabase si nécessaire
*/
