-- =====================================================
-- CORRECTION IMMÉDIATE - UTILISATEUR siniam34@gmail.com
-- Script pour résoudre le problème spécifique de cet utilisateur
-- =====================================================

-- =====================================================
-- ÉTAPE 1: IDENTIFIER L'UTILISATEUR ET SES FACTEURS
-- =====================================================

-- Trouver l'utilisateur et ses facteurs MFA
SELECT 
    'UTILISATEUR ET FACTEURS' as titre,
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    p.two_factor_enabled,
    COUNT(mf.id) as "Nombre de facteurs MFA"
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN auth.mfa_factors mf ON u.id = mf.user_id
WHERE u.email = 'siniam34@gmail.com'
GROUP BY u.id, u.email, u.email_confirmed_at, p.two_factor_enabled;

-- =====================================================
-- ÉTAPE 2: AFFICHER TOUS LES FACTEURS DE CET UTILISATEUR
-- =====================================================

-- Afficher tous les facteurs MFA de cet utilisateur
SELECT 
    'FACTEURS MFA DE L''UTILISATEUR' as titre,
    mf.id as factor_id,
    mf.factor_type,
    mf.status,
    mf.friendly_name,
    mf.created_at,
    mf.updated_at,
    CASE 
        WHEN mf.id = 'e5993a53-9da1-4014-bd94-8bd83d065d66' THEN '🎯 FACTEUR PROBLÉMATIQUE'
        ELSE '📋 Autre facteur'
    END as "Type"
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
WHERE u.email = 'siniam34@gmail.com'
ORDER BY mf.created_at DESC;

-- =====================================================
-- ÉTAPE 3: NETTOYAGE COMPLET POUR CET UTILISATEUR
-- =====================================================

-- Supprimer TOUS les facteurs MFA de cet utilisateur (ils sont corrompus)
DELETE FROM auth.mfa_factors 
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
);

-- Afficher le résultat du nettoyage
SELECT 
    'NETTOYAGE TERMINÉ' as statut,
    'Tous les facteurs MFA supprimés pour siniam34@gmail.com' as action;

-- =====================================================
-- ÉTAPE 4: RÉINITIALISER LE PROFIL
-- =====================================================

-- Remettre le profil à zéro pour permettre une nouvelle configuration
UPDATE profiles 
SET 
    two_factor_enabled = FALSE,
    updated_at = NOW()
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'
);

-- Afficher le résultat de la réinitialisation
SELECT 
    'PROFIL RÉINITIALISÉ' as statut,
    'two_factor_enabled remis à FALSE' as action;

-- =====================================================
-- ÉTAPE 5: VÉRIFICATION FINALE
-- =====================================================

-- Vérifier que le nettoyage a fonctionné
SELECT 
    'VÉRIFICATION FINALE' as titre,
    u.id as user_id,
    u.email,
    p.two_factor_enabled,
    COUNT(mf.id) as "Facteurs MFA restants"
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN auth.mfa_factors mf ON u.id = mf.user_id
WHERE u.email = 'siniam34@gmail.com'
GROUP BY u.id, u.email, p.two_factor_enabled;

-- =====================================================
-- ÉTAPE 6: VÉRIFIER QU'AUCUN FACTEUR NE RESTE
-- =====================================================

-- S'assurer qu'aucun facteur ne reste pour cet utilisateur
SELECT 
    'FACTEURS RESTANTS' as titre,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ AUCUN FACTEUR RESTANT'
        ELSE '❌ FACTEURS RESTANTS: ' || COUNT(*)::TEXT
    END as "Résultat"
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
WHERE u.email = 'siniam34@gmail.com';

-- =====================================================
-- ÉTAPE 7: INSTRUCTIONS POUR L'UTILISATEUR
-- =====================================================

-- Afficher les instructions pour l'utilisateur
SELECT 
    'INSTRUCTIONS POUR L''UTILISATEUR' as titre,
    '1. Se reconnecter sur l''application' as instruction_1,
    '2. Aller dans les paramètres de sécurité' as instruction_2,
    '3. Configurer un nouveau facteur MFA' as instruction_3,
    '4. Scanner le nouveau QR code' as instruction_4,
    '5. Entrer le code de vérification' as instruction_5;

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT :

1. **Identification** : Trouve l'utilisateur et ses facteurs MFA
2. **Nettoyage complet** : Supprime TOUS les facteurs MFA de cet utilisateur
3. **Réinitialisation** : Remet le profil à zéro
4. **Vérification** : Confirme que le nettoyage a fonctionné
5. **Instructions** : Donne les étapes pour l'utilisateur

🔧 COMMENT L'UTILISER :

1. Exécutez ce script dans l'éditeur SQL de Supabase
2. Le script nettoiera complètement l'état MFA de cet utilisateur
3. Vérifiez que le résultat est "AUCUN FACTEUR RESTANT"

⚠️ IMPORTANT :

- Ce script supprime TOUS les facteurs MFA de cet utilisateur
- L'utilisateur devra reconfigurer complètement son 2FA
- C'est nécessaire car les facteurs sont corrompus

🚀 APRÈS EXÉCUTION :

1. L'utilisateur devra se reconnecter
2. Il pourra configurer un nouveau facteur MFA
3. L'erreur "Factor not found" ne se produira plus
4. Le nouveau facteur sera propre et fonctionnel

💡 POURQUOI CETTE SOLUTION :

- Les facteurs MFA de cet utilisateur sont corrompus
- Il est plus simple de tout supprimer et recommencer
- Cela évite les problèmes de synchronisation
- L'utilisateur aura un état MFA propre

🆘 SI LE PROBLÈME PERSISTE :

1. Vérifiez que le script s'est exécuté sans erreur
2. Vérifiez que "AUCUN FACTEUR RESTANT" s'affiche
3. Redémarrez votre application
4. Demandez à l'utilisateur de se reconnecter
5. Contactez le support Supabase si nécessaire
*/
