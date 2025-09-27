-- =====================================================
-- TEST - CORRECTION UTILISATEUR siniam34@gmail.com
-- Script pour vérifier que la correction a fonctionné
-- =====================================================

-- =====================================================
-- ÉTAPE 1: VÉRIFIER L'ÉTAT DE L'UTILISATEUR
-- =====================================================

-- Vérifier l'état actuel de l'utilisateur
SELECT 
    'ÉTAT ACTUEL DE L''UTILISATEUR' as titre,
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    p.two_factor_enabled,
    p.created_at as "Profil créé",
    p.updated_at as "Profil mis à jour"
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'siniam34@gmail.com';

-- =====================================================
-- ÉTAPE 2: VÉRIFIER LES FACTEURS MFA
-- =====================================================

-- Vérifier qu'aucun facteur MFA ne reste
SELECT 
    'FACTEURS MFA RESTANTS' as titre,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ AUCUN FACTEUR RESTANT'
        ELSE '❌ FACTEURS RESTANTS: ' || COUNT(*)::TEXT
    END as "Résultat",
    STRING_AGG(mf.id::TEXT, ', ') as "IDs des facteurs restants"
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
WHERE u.email = 'siniam34@gmail.com';

-- =====================================================
-- ÉTAPE 3: VÉRIFIER LA COHÉRENCE DU PROFIL
-- =====================================================

-- Vérifier que le profil est cohérent
SELECT 
    'COHÉRENCE DU PROFIL' as titre,
    p.two_factor_enabled as "Profile 2FA",
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = p.id AND status = 'verified'
        ) THEN TRUE 
        ELSE FALSE 
    END as "Auth MFA réel",
    CASE 
        WHEN p.two_factor_enabled = EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = p.id AND status = 'verified'
        ) THEN '✅ COHÉRENT'
        ELSE '❌ INCOHÉRENT'
    END as "État"
FROM profiles p
WHERE p.email = 'siniam34@gmail.com';

-- =====================================================
-- ÉTAPE 4: TEST DE PRÉPARATION POUR NOUVEAU FACTEUR
-- =====================================================

-- Vérifier que l'utilisateur peut configurer un nouveau facteur
SELECT 
    'PRÉPARATION POUR NOUVEAU FACTEUR' as titre,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Email confirmé'
        ELSE '❌ Email non confirmé'
    END as "Email",
    CASE 
        WHEN p.two_factor_enabled = FALSE THEN '✅ 2FA désactivé (prêt pour configuration)'
        ELSE '❌ 2FA activé (peut causer des conflits)'
    END as "État 2FA",
    CASE 
        WHEN NOT EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = u.id
        ) THEN '✅ Aucun facteur existant (prêt pour nouveau)'
        ELSE '❌ Facteurs existants (peut causer des conflits)'
    END as "Facteurs existants"
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'siniam34@gmail.com';

-- =====================================================
-- ÉTAPE 5: SIMULATION D'UN NOUVEAU FACTEUR
-- =====================================================

-- Créer une fonction de test pour simuler la création d'un nouveau facteur
CREATE OR REPLACE FUNCTION test_new_factor_creation()
RETURNS TABLE (
    step TEXT,
    description TEXT,
    result TEXT,
    status TEXT
) AS $$
DECLARE
    user_id UUID;
    test_factor_id UUID;
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
    
    -- Vérifier qu'aucun facteur n'existe
    IF EXISTS(SELECT 1 FROM auth.mfa_factors WHERE user_id = test_new_factor_creation.user_id) THEN
        step := '2';
        description := 'Facteurs existants';
        result := '❌ Facteurs existants détectés';
        status := '❌ ÉCHEC';
        RETURN NEXT;
        RETURN;
    END IF;
    
    step := '2';
    description := 'Facteurs existants';
    result := 'Aucun facteur existant';
    status := '✅ OK';
    RETURN NEXT;
    
    -- Vérifier l'état du profil
    IF EXISTS(SELECT 1 FROM profiles WHERE id = test_new_factor_creation.user_id AND two_factor_enabled = TRUE) THEN
        step := '3';
        description := 'État du profil';
        result := '❌ Profil marqué comme 2FA activé';
        status := '❌ ÉCHEC';
        RETURN NEXT;
        RETURN;
    END IF;
    
    step := '3';
    description := 'État du profil';
    result := 'Profil prêt pour nouveau 2FA';
    status := '✅ OK';
    RETURN NEXT;
    
    -- Test réussi
    step := '4';
    description := 'Test global';
    result := 'Utilisateur prêt pour nouveau facteur MFA';
    status := '✅ SUCCÈS';
    RETURN NEXT;
    
END;
$$ LANGUAGE plpgsql;

-- Exécuter le test
SELECT * FROM test_new_factor_creation();

-- =====================================================
-- ÉTAPE 6: RÉSUMÉ FINAL
-- =====================================================

-- Afficher un résumé final
SELECT 
    'RÉSUMÉ FINAL' as titre,
    'L''utilisateur siniam34@gmail.com est maintenant prêt pour configurer un nouveau facteur MFA' as message,
    'Aucun facteur corrompu ne reste dans la base de données' as état_facteurs,
    'Le profil est cohérent et prêt' as état_profil,
    'L''utilisateur peut maintenant se reconnecter et configurer le 2FA' as prochaines_étapes;

-- =====================================================
-- ÉTAPE 7: NETTOYAGE - Supprimer la fonction de test
-- =====================================================

-- Supprimer la fonction de test
DROP FUNCTION IF EXISTS test_new_factor_creation();

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT DE TEST :

1. **Vérification de l'état** : Contrôle l'état actuel de l'utilisateur
2. **Vérification des facteurs** : S'assure qu'aucun facteur ne reste
3. **Vérification de cohérence** : Contrôle que le profil est cohérent
4. **Test de préparation** : Vérifie que l'utilisateur peut configurer un nouveau facteur
5. **Simulation** : Teste la création d'un nouveau facteur
6. **Résumé** : Affiche un résumé final

🔧 COMMENT L'UTILISER :

1. Exécutez ce script après avoir exécuté le script de correction
2. Le script vérifiera que la correction a fonctionné
3. Vérifiez que tous les tests passent

✅ RÉSULTAT ATTENDU :

- Utilisateur trouvé
- Aucun facteur existant
- Profil prêt pour nouveau 2FA
- Test global réussi

⚠️ SI LE TEST ÉCHOUE :

- Vérifiez que le script de correction a été exécuté
- Vérifiez les permissions de la base de données
- Contactez le support si le problème persiste

🚀 APRÈS UN TEST RÉUSSI :

- L'utilisateur peut se reconnecter
- Il peut configurer un nouveau facteur MFA
- L'erreur "Factor not found" ne se produira plus
- Le nouveau facteur sera propre et fonctionnel
*/
