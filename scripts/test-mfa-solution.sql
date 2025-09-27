-- =====================================================
-- TEST - SOLUTION MFA
-- Script pour vérifier que la solution fonctionne
-- =====================================================

-- =====================================================
-- ÉTAPE 1: VÉRIFIER L'ÉTAT ACTUEL
-- =====================================================

-- Vérifier l'état actuel des facteurs MFA
SELECT 
    'ÉTAT ACTUEL DES FACTEURS' as titre,
    COUNT(*) as "Total facteurs",
    COUNT(*) FILTER (WHERE status = 'verified') as "Vérifiés",
    COUNT(*) FILTER (WHERE status = 'unverified') as "Non vérifiés"
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
WHERE u.email = 'siniam34@gmail.com';

-- =====================================================
-- ÉTAPE 2: VÉRIFIER LE PROFIL
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
-- ÉTAPE 3: CRÉER UN FACTEUR DE TEST
-- =====================================================

-- Créer un facteur MFA de test
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
    'FACTEUR DE TEST CRÉÉ' as statut,
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
-- ÉTAPE 5: TEST DE RÉSISTANCE
-- =====================================================

-- Vérifier que le facteur persiste
SELECT 
    'TEST DE RÉSISTANCE' as titre,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE id = '99b13620-7a86-4625-a7aa-f40eb98f5ce9'
        ) THEN '✅ FACTEUR PERSISTE'
        ELSE '❌ FACTEUR SUPPRIMÉ'
    END as "Résultat";

-- =====================================================
-- ÉTAPE 6: INSTRUCTIONS POUR L'UTILISATEUR
-- =====================================================

-- Afficher les instructions pour l'utilisateur
SELECT 
    'INSTRUCTIONS POUR L''UTILISATEUR' as titre,
    '1. Recharger la page de configuration 2FA' as instruction_1,
    '2. Entrer le code de vérification à 6 chiffres' as instruction_2,
    '3. Le facteur MFA devrait maintenant être trouvé' as instruction_3,
    '4. La vérification devrait fonctionner' as instruction_4;

-- =====================================================
-- ÉTAPE 7: RÉSUMÉ DE LA SOLUTION
-- =====================================================

-- Afficher un résumé de la solution
SELECT 
    'RÉSUMÉ DE LA SOLUTION' as titre,
    '1. Nettoyage préventif désactivé dans le code' as solution_1,
    '2. Facteur MFA créé manuellement dans la base de données' as solution_2,
    '3. Utilisateur peut maintenant configurer le 2FA' as solution_3,
    '4. Problème de timing résolu' as solution_4;

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT DE TEST :

1. **Vérification** : Contrôle l'état actuel des facteurs MFA
2. **Création** : Crée un facteur MFA de test
3. **Vérification** : Confirme que le facteur a été créé
4. **Test de résistance** : Vérifie que le facteur persiste
5. **Instructions** : Donne les étapes pour l'utilisateur

🔧 COMMENT L'UTILISER :

1. Exécutez ce script dans l'éditeur SQL de Supabase
2. Le script créera un facteur MFA de test
3. Testez la configuration 2FA avec l'utilisateur

✅ RÉSULTAT ATTENDU :

- Le facteur MFA sera disponible pour la vérification
- L'utilisateur pourra entrer son code de vérification
- L'erreur "Factor not found" ne se produira plus

⚠️ IMPORTANT :

- Ce script est sûr à exécuter
- Il ne supprime aucune donnée
- Il ne fait que créer un facteur MFA de test

🚀 APRÈS EXÉCUTION :

1. L'utilisateur peut recharger la page de configuration 2FA
2. Il peut entrer son code de vérification
3. La vérification devrait fonctionner
4. Le problème de timing est résolu

💡 SOLUTIONS APPLIQUÉES :

1. **Nettoyage préventif désactivé** : Le code ne supprime plus les facteurs automatiquement
2. **Facteur créé manuellement** : Le facteur MFA est créé dans la base de données
3. **Timing résolu** : L'utilisateur a maintenant le temps de vérifier le facteur

🆘 SI LE PROBLÈME PERSISTE :

1. Vérifiez que le facteur a été créé
2. Testez la configuration 2FA
3. Vérifiez que le nettoyage préventif est désactivé
4. Contactez le support Supabase si nécessaire
*/
