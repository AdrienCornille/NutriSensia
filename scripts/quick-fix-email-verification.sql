-- =====================================================
-- CORRECTION RAPIDE - VÉRIFICATION D'EMAIL
-- Script simple pour corriger immédiatement le problème
-- =====================================================

-- =====================================================
-- ÉTAPE 1: DIAGNOSTIC - Voir l'état actuel
-- =====================================================

-- Afficher tous les profils avec leur état de vérification
SELECT 
    'DIAGNOSTIC - État actuel des profils' as titre,
    p.id,
    p.email,
    p.email_verified as "Email vérifié dans profiles",
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN TRUE 
        ELSE FALSE 
    END as "Email confirmé dans auth.users",
    u.email_confirmed_at as "Date de confirmation",
    CASE 
        WHEN p.email_verified = (u.email_confirmed_at IS NOT NULL) THEN '✅ Cohérent'
        ELSE '❌ Incohérent'
    END as "État"
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- =====================================================
-- ÉTAPE 2: CORRECTION - Mettre à jour les profils incohérents
-- =====================================================

-- Corriger tous les profils où l'email est confirmé dans auth.users 
-- mais pas marqué comme vérifié dans profiles
UPDATE profiles 
SET 
    email_verified = TRUE,
    updated_at = NOW()
WHERE id IN (
    SELECT p.id 
    FROM profiles p
    INNER JOIN auth.users u ON p.id = u.id
    WHERE u.email_confirmed_at IS NOT NULL 
    AND p.email_verified = FALSE
);

-- Afficher le nombre de profils corrigés
SELECT 
    'CORRECTION TERMINÉE' as statut,
    COUNT(*) as "Profils corrigés"
FROM profiles p
INNER JOIN auth.users u ON p.id = u.id
WHERE u.email_confirmed_at IS NOT NULL 
AND p.email_verified = TRUE;

-- =====================================================
-- ÉTAPE 3: VÉRIFICATION - Voir le résultat final
-- =====================================================

-- Afficher l'état final après correction
SELECT 
    'RÉSULTAT FINAL' as titre,
    p.id,
    p.email,
    p.email_verified as "Email vérifié",
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN TRUE 
        ELSE FALSE 
    END as "Email confirmé",
    CASE 
        WHEN p.email_verified = (u.email_confirmed_at IS NOT NULL) THEN '✅ Cohérent'
        ELSE '❌ Toujours incohérent'
    END as "État final"
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- =====================================================
-- ÉTAPE 4: RÉSUMÉ STATISTIQUE
-- =====================================================

-- Afficher un résumé des statistiques
SELECT 
    'RÉSUMÉ STATISTIQUE' as titre,
    COUNT(*) as "Total des profils",
    COUNT(*) FILTER (WHERE email_verified = TRUE) as "Emails vérifiés",
    COUNT(*) FILTER (WHERE email_verified = FALSE) as "Emails non vérifiés",
    ROUND(
        (COUNT(*) FILTER (WHERE email_verified = TRUE)::DECIMAL / COUNT(*)) * 100, 
        2
    ) as "Pourcentage vérifiés"
FROM profiles;

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT :

1. **Diagnostic** : Montre l'état actuel de tous les profils
2. **Correction** : Met à jour tous les profils incohérents
3. **Vérification** : Confirme que la correction a fonctionné
4. **Statistiques** : Affiche un résumé final

🔧 COMMENT L'UTILISER :

1. Copiez ce script dans l'éditeur SQL de Supabase
2. Exécutez-le d'un coup
3. Vérifiez les résultats affichés

⚠️ IMPORTANT :

- Ce script est sûr à exécuter
- Il ne supprime aucune donnée
- Il ne fait que corriger les incohérences existantes

🚀 PROCHAINES ÉTAPES :

Après avoir exécuté ce script, exécutez aussi le script 
"fix-email-verification-sync.sql" pour éviter que le problème 
se reproduise à l'avenir.
*/
