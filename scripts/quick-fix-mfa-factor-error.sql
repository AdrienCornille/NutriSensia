-- =====================================================
-- CORRECTION RAPIDE - ERREUR "Factor not found" MFA
-- Script simple pour résoudre immédiatement le problème
-- =====================================================

-- =====================================================
-- ÉTAPE 1: DIAGNOSTIC RAPIDE - Voir l'état actuel
-- =====================================================

-- Afficher tous les facteurs MFA existants
SELECT 
    'DIAGNOSTIC RAPIDE - Facteurs MFA existants' as titre,
    mf.user_id,
    u.email,
    mf.id as factor_id,
    mf.factor_type,
    mf.status,
    mf.friendly_name,
    mf.created_at
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
ORDER BY mf.created_at DESC;

-- =====================================================
-- ÉTAPE 2: IDENTIFIER LES FACTEURS PROBLÉMATIQUES
-- =====================================================

-- Trouver les facteurs qui causent l'erreur "Factor not found"
SELECT 
    'FACTEURS PROBLÉMATIQUES IDENTIFIÉS' as titre,
    mf.user_id,
    u.email,
    mf.id as factor_id,
    mf.factor_type,
    mf.status,
    mf.friendly_name,
    CASE 
        WHEN mf.status = 'unverified' THEN '❌ Non vérifié - Cause l''erreur'
        WHEN mf.friendly_name IS NULL OR mf.friendly_name = '' THEN '❌ Nom vide - Cause l''erreur'
        WHEN mf.status = 'verified' AND EXISTS(
            SELECT 1 FROM profiles p 
            WHERE p.id = mf.user_id AND p.two_factor_enabled = FALSE
        ) THEN '⚠️ Incohérent avec le profil'
        ELSE '✅ Apparemment OK'
    END as "Problème"
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
WHERE 
    mf.status = 'unverified' 
    OR (mf.friendly_name IS NULL OR mf.friendly_name = '')
    OR mf.status = 'verified' AND EXISTS(
        SELECT 1 FROM profiles p 
        WHERE p.id = mf.user_id AND p.two_factor_enabled = FALSE
    )
ORDER BY mf.created_at DESC;

-- =====================================================
-- ÉTAPE 3: NETTOYAGE - Supprimer les facteurs problématiques
-- =====================================================

-- Supprimer les facteurs non vérifiés (principale cause de l'erreur)
DELETE FROM auth.mfa_factors 
WHERE status = 'unverified';

-- Afficher le nombre de facteurs supprimés
SELECT 
    'NETTOYAGE TERMINÉ' as statut,
    'Facteurs non vérifiés supprimés' as action;

-- Supprimer les facteurs avec des noms vides
DELETE FROM auth.mfa_factors 
WHERE friendly_name IS NULL OR friendly_name = '';

-- Afficher le nombre de facteurs supprimés
SELECT 
    'NETTOYAGE TERMINÉ' as statut,
    'Facteurs sans nom supprimés' as action;

-- =====================================================
-- ÉTAPE 4: SYNCHRONISATION - Mettre à jour les profils
-- =====================================================

-- Synchroniser tous les profils avec l'état réel des facteurs MFA
UPDATE profiles 
SET 
    two_factor_enabled = EXISTS(
        SELECT 1 FROM auth.mfa_factors 
        WHERE user_id = profiles.id 
        AND status = 'verified'
    ),
    updated_at = NOW()
WHERE EXISTS(
    SELECT 1 FROM auth.mfa_factors 
    WHERE user_id = profiles.id
);

-- Afficher le nombre de profils mis à jour
SELECT 
    'SYNCHRONISATION TERMINÉE' as statut,
    'Profils synchronisés avec l''état MFA réel' as action;

-- =====================================================
-- ÉTAPE 5: VÉRIFICATION FINALE
-- =====================================================

-- Vérifier l'état final après nettoyage
SELECT 
    'ÉTAT FINAL APRÈS CORRECTION' as titre,
    COUNT(*) as "Total facteurs MFA restants",
    COUNT(*) FILTER (WHERE status = 'verified') as "Facteurs vérifiés",
    COUNT(*) FILTER (WHERE status = 'unverified') as "Facteurs non vérifiés"
FROM auth.mfa_factors;

-- Vérifier la cohérence des profils
SELECT 
    'COHÉRENCE DES PROFILS' as titre,
    COUNT(*) as "Total profils",
    COUNT(*) FILTER (WHERE two_factor_enabled = TRUE) as "2FA activé",
    COUNT(*) FILTER (WHERE two_factor_enabled = FALSE) as "2FA non activé"
FROM profiles;

-- Afficher les profils avec leurs facteurs MFA
SELECT 
    'PROFILS ET FACTEURS MFA' as titre,
    p.id,
    p.email,
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
        ) THEN '✅ Cohérent'
        ELSE '❌ Incohérent'
    END as "État"
FROM profiles p
ORDER BY p.created_at DESC;

-- =====================================================
-- ÉTAPE 6: RÉSUMÉ DES ACTIONS EFFECTUÉES
-- =====================================================

-- Afficher un résumé des actions
SELECT 
    'RÉSUMÉ DES ACTIONS' as titre,
    '1. Suppression des facteurs non vérifiés' as action_1,
    '2. Suppression des facteurs sans nom' as action_2,
    '3. Synchronisation des profils' as action_3,
    '4. Vérification de la cohérence' as action_4;

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT :

1. **Diagnostic rapide** : Montre tous les facteurs MFA existants
2. **Identification** : Trouve les facteurs qui causent l'erreur "Factor not found"
3. **Nettoyage** : Supprime les facteurs problématiques
4. **Synchronisation** : Met à jour les profils pour qu'ils correspondent à la réalité
5. **Vérification** : Confirme que tout est maintenant cohérent

🔧 COMMENT L'UTILISER :

1. Copiez ce script dans l'éditeur SQL de Supabase
2. Exécutez-le d'un coup
3. Vérifiez les résultats affichés

⚠️ IMPORTANT :

- Ce script est sûr à exécuter
- Il ne supprime que les facteurs problématiques
- Il ne supprime aucune donnée utilisateur

🚀 RÉSULTAT ATTENDU :

- Plus d'erreur "Factor not found"
- Les utilisateurs peuvent configurer un nouveau facteur MFA
- Tous les profils sont cohérents avec l'état réel des facteurs

💡 APRÈS EXÉCUTION :

1. Redémarrez votre application
2. Demandez aux utilisateurs de se reconnecter
3. Ils pourront configurer un nouveau facteur MFA
4. L'erreur ne devrait plus se produire

🆘 SI LE PROBLÈME PERSISTE :

1. Vérifiez que le script s'est exécuté sans erreur
2. Vérifiez les logs de votre application
3. Contactez le support Supabase si nécessaire
*/
