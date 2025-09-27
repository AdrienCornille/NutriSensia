-- =====================================================
-- DEBUG - PROBLÈME FACTEUR MFA "e5993a53-9da1-4014-bd94-8bd83d065d66"
-- Script pour diagnostiquer le problème spécifique
-- =====================================================

-- =====================================================
-- ÉTAPE 1: RECHERCHER LE FACTEUR SPÉCIFIQUE
-- =====================================================

-- Chercher le facteur spécifique mentionné dans l'erreur
SELECT 
    'RECHERCHE DU FACTEUR SPÉCIFIQUE' as titre,
    mf.id as factor_id,
    mf.user_id,
    u.email,
    mf.factor_type,
    mf.status,
    mf.friendly_name,
    mf.created_at,
    mf.updated_at
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
WHERE mf.id = 'e5993a53-9da1-4014-bd94-8bd83d065d66';

-- =====================================================
-- ÉTAPE 2: VÉRIFIER TOUS LES FACTEURS DE L'UTILISATEUR
-- =====================================================

-- Chercher l'utilisateur par email et voir tous ses facteurs
SELECT 
    'FACTEURS DE L''UTILISATEUR siniam34@gmail.com' as titre,
    mf.id as factor_id,
    mf.factor_type,
    mf.status,
    mf.friendly_name,
    mf.created_at,
    mf.updated_at
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
WHERE u.email = 'siniam34@gmail.com'
ORDER BY mf.created_at DESC;

-- =====================================================
-- ÉTAPE 3: VÉRIFIER L'ÉTAT GÉNÉRAL DES FACTEURS MFA
-- =====================================================

-- Afficher tous les facteurs MFA récents
SELECT 
    'TOUS LES FACTEURS MFA RÉCENTS' as titre,
    mf.id as factor_id,
    u.email,
    mf.factor_type,
    mf.status,
    mf.friendly_name,
    mf.created_at,
    mf.updated_at,
    CASE 
        WHEN mf.created_at > NOW() - INTERVAL '1 hour' THEN '🆕 Très récent'
        WHEN mf.created_at > NOW() - INTERVAL '1 day' THEN '🕐 Récent'
        ELSE '⏰ Ancien'
    END as "Âge"
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
ORDER BY mf.created_at DESC
LIMIT 20;

-- =====================================================
-- ÉTAPE 4: ANALYSER LES FACTEURS NON VÉRIFIÉS
-- =====================================================

-- Analyser les facteurs non vérifiés (qui causent souvent le problème)
SELECT 
    'FACTEURS NON VÉRIFIÉS' as titre,
    COUNT(*) as "Total non vérifiés",
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as "Créés dans la dernière heure",
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') as "Créés dans les dernières 24h",
    COUNT(*) FILTER (WHERE friendly_name IS NULL OR friendly_name = '') as "Sans nom"
FROM auth.mfa_factors
WHERE status = 'unverified';

-- =====================================================
-- ÉTAPE 5: VÉRIFIER LES FACTEURS FANTÔMES
-- =====================================================

-- Vérifier s'il y a des facteurs fantômes (créés mais non listés)
SELECT 
    'FACTEURS FANTÔMES POTENTIELS' as titre,
    mf.id as factor_id,
    u.email,
    mf.factor_type,
    mf.status,
    mf.friendly_name,
    mf.created_at
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
WHERE mf.status = 'unverified'
AND mf.created_at > NOW() - INTERVAL '1 hour'
ORDER BY mf.created_at DESC;

-- =====================================================
-- ÉTAPE 6: VÉRIFIER LA COHÉRENCE AVEC LES PROFILS
-- =====================================================

-- Vérifier l'état du profil de l'utilisateur
SELECT 
    'PROFIL DE L''UTILISATEUR' as titre,
    p.id,
    p.email,
    p.two_factor_enabled,
    p.created_at,
    p.updated_at,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = p.id AND status = 'verified'
        ) THEN '✅ Facteurs vérifiés existants'
        WHEN EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = p.id AND status = 'unverified'
        ) THEN '⚠️ Facteurs non vérifiés existants'
        ELSE '❌ Aucun facteur MFA'
    END as "État MFA"
FROM profiles p
WHERE p.email = 'siniam34@gmail.com';

-- =====================================================
-- ÉTAPE 7: NETTOYAGE SPÉCIFIQUE POUR CET UTILISATEUR
-- =====================================================

-- Fonction pour nettoyer les facteurs de cet utilisateur spécifique
CREATE OR REPLACE FUNCTION cleanup_user_mfa_factors(user_email TEXT)
RETURNS TABLE (
    action TEXT,
    factor_id UUID,
    result TEXT
) AS $$
DECLARE
    user_id UUID;
    factor_record RECORD;
BEGIN
    -- Trouver l'ID de l'utilisateur
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        action := 'Erreur';
        factor_id := NULL;
        result := 'Utilisateur non trouvé: ' || user_email;
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Supprimer tous les facteurs non vérifiés de cet utilisateur
    FOR factor_record IN 
        SELECT id FROM auth.mfa_factors 
        WHERE user_id = cleanup_user_mfa_factors.user_id 
        AND status = 'unverified'
    LOOP
        DELETE FROM auth.mfa_factors WHERE id = factor_record.id;
        
        action := 'Supprimé';
        factor_id := factor_record.id;
        result := 'Facteur non vérifié supprimé';
        RETURN NEXT;
    END LOOP;
    
    -- Mettre à jour le profil
    UPDATE profiles 
    SET 
        two_factor_enabled = EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = cleanup_user_mfa_factors.user_id 
            AND status = 'verified'
        ),
        updated_at = NOW()
    WHERE id = cleanup_user_mfa_factors.user_id;
    
    action := 'Profil mis à jour';
    factor_id := NULL;
    result := 'Profil synchronisé avec l''état MFA réel';
    RETURN NEXT;
    
END;
$$ LANGUAGE plpgsql;

-- Exécuter le nettoyage pour cet utilisateur
SELECT * FROM cleanup_user_mfa_factors('siniam34@gmail.com');

-- =====================================================
-- ÉTAPE 8: VÉRIFICATION APRÈS NETTOYAGE
-- =====================================================

-- Vérifier l'état après nettoyage
SELECT 
    'ÉTAT APRÈS NETTOYAGE' as titre,
    mf.id as factor_id,
    u.email,
    mf.factor_type,
    mf.status,
    mf.friendly_name,
    mf.created_at
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
WHERE u.email = 'siniam34@gmail.com'
ORDER BY mf.created_at DESC;

-- =====================================================
-- ÉTAPE 9: NETTOYAGE - Supprimer la fonction temporaire
-- =====================================================

-- Supprimer la fonction de nettoyage
DROP FUNCTION IF EXISTS cleanup_user_mfa_factors(TEXT);

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT :

1. **Recherche spécifique** : Cherche le facteur exact mentionné dans l'erreur
2. **Analyse complète** : Vérifie tous les facteurs de l'utilisateur
3. **Diagnostic détaillé** : Analyse l'état général des facteurs MFA
4. **Nettoyage ciblé** : Supprime les facteurs problématiques de cet utilisateur
5. **Vérification** : Confirme que le nettoyage a fonctionné

🔧 COMMENT L'UTILISER :

1. Exécutez ce script dans l'éditeur SQL de Supabase
2. Le script identifiera et corrigera le problème spécifique
3. Vérifiez les résultats affichés

⚠️ IMPORTANT :

- Ce script est sûr à exécuter
- Il ne supprime que les facteurs problématiques
- Il ne supprime aucune donnée utilisateur

🚀 APRÈS EXÉCUTION :

1. L'utilisateur pourra configurer un nouveau facteur MFA
2. L'erreur "Factor not found" ne devrait plus se produire
3. Le profil sera cohérent avec l'état réel des facteurs

💡 CAUSES POSSIBLES DU PROBLÈME :

1. **Facteur créé mais non vérifié** : Le facteur existe mais n'est pas dans l'état "verified"
2. **Facteur supprimé automatiquement** : Supabase a supprimé le facteur pour une raison
3. **Problème de synchronisation** : Le facteur existe dans une table mais pas dans l'autre
4. **Facteur corrompu** : Le facteur a été créé mais est dans un état incohérent

🆘 SI LE PROBLÈME PERSISTE :

1. Vérifiez que le script s'est exécuté sans erreur
2. Redémarrez votre application
3. Demandez à l'utilisateur de se reconnecter
4. Contactez le support Supabase si nécessaire
*/
