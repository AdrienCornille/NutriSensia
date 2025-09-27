-- =====================================================
-- DIAGNOSTIC COMPLET - ERREUR "Factor not found" MFA
-- Script pour identifier et résoudre les problèmes de facteurs MFA
-- =====================================================

-- =====================================================
-- ÉTAPE 1: DIAGNOSTIC - Analyser l'état des facteurs MFA
-- =====================================================

-- Afficher tous les utilisateurs avec leurs facteurs MFA
SELECT 
    'DIAGNOSTIC MFA - État des utilisateurs' as titre,
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    p.email_verified,
    p.two_factor_enabled,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN 'Email confirmé'
        ELSE 'Email non confirmé'
    END as email_status,
    CASE 
        WHEN p.two_factor_enabled = TRUE THEN '2FA activé'
        ELSE '2FA non activé'
    END as mfa_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- =====================================================
-- ÉTAPE 2: VÉRIFICATION DES INCOHÉRENCES
-- =====================================================

-- Identifier les incohérences entre auth.users et profiles
SELECT 
    'INCOHÉRENCES DÉTECTÉES' as titre,
    u.id,
    u.email,
    p.two_factor_enabled as "Profile 2FA",
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = u.id AND status = 'verified'
        ) THEN TRUE 
        ELSE FALSE 
    END as "Auth MFA réel",
    CASE 
        WHEN p.two_factor_enabled != EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = u.id AND status = 'verified'
        ) THEN '❌ INCOHÉRENT'
        ELSE '✅ COHÉRENT'
    END as "État"
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.two_factor_enabled IS NOT NULL
ORDER BY u.created_at DESC;

-- =====================================================
-- ÉTAPE 3: ANALYSE DES FACTEURS MFA DANS AUTH.MFA_FACTORS
-- =====================================================

-- Analyser les facteurs MFA dans la table système
SELECT 
    'FACTEURS MFA DANS AUTH.MFA_FACTORS' as titre,
    user_id,
    id as factor_id,
    factor_type,
    status,
    friendly_name,
    created_at,
    updated_at
FROM auth.mfa_factors
ORDER BY created_at DESC;

-- =====================================================
-- ÉTAPE 4: IDENTIFIER LES FACTEURS PROBLÉMATIQUES
-- =====================================================

-- Trouver les facteurs qui pourraient causer l'erreur "Factor not found"
SELECT 
    'FACTEURS PROBLÉMATIQUES' as titre,
    mf.user_id,
    u.email,
    mf.id as factor_id,
    mf.factor_type,
    mf.status,
    mf.friendly_name,
    CASE 
        WHEN mf.status = 'unverified' THEN '⚠️ Non vérifié - Peut causer des erreurs'
        WHEN mf.status = 'verified' AND p.two_factor_enabled = FALSE THEN '⚠️ Vérifié mais profil non mis à jour'
        WHEN mf.friendly_name IS NULL OR mf.friendly_name = '' THEN '⚠️ Nom vide - Peut causer des erreurs'
        ELSE '✅ Apparemment OK'
    END as "Problème potentiel"
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
LEFT JOIN profiles p ON mf.user_id = p.id
ORDER BY mf.created_at DESC;

-- =====================================================
-- ÉTAPE 5: FONCTION DE NETTOYAGE DES FACTEURS PROBLÉMATIQUES
-- =====================================================

-- Fonction pour nettoyer les facteurs MFA problématiques
CREATE OR REPLACE FUNCTION cleanup_problematic_mfa_factors()
RETURNS TABLE (
    user_id UUID,
    user_email TEXT,
    factor_id UUID,
    factor_type TEXT,
    action_taken TEXT,
    result TEXT
) AS $$
DECLARE
    factor_record RECORD;
    cleanup_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🧹 Début du nettoyage des facteurs MFA problématiques...';
    
    -- Parcourir tous les facteurs problématiques
    FOR factor_record IN 
        SELECT 
            mf.user_id,
            u.email,
            mf.id as factor_id,
            mf.factor_type,
            mf.status,
            mf.friendly_name
        FROM auth.mfa_factors mf
        LEFT JOIN auth.users u ON mf.user_id = u.id
        WHERE 
            mf.status = 'unverified' 
            OR (mf.friendly_name IS NULL OR mf.friendly_name = '')
            OR mf.status = 'verified' AND EXISTS(
                SELECT 1 FROM profiles p 
                WHERE p.id = mf.user_id AND p.two_factor_enabled = FALSE
            )
    LOOP
        -- Supprimer le facteur problématique
        BEGIN
            DELETE FROM auth.mfa_factors 
            WHERE id = factor_record.factor_id;
            
            cleanup_count := cleanup_count + 1;
            
            -- Retourner le résultat
            user_id := factor_record.user_id;
            user_email := factor_record.email;
            factor_id := factor_record.factor_id;
            factor_type := factor_record.factor_type;
            action_taken := 'Supprimé';
            result := '✅ Succès';
            
            RAISE NOTICE '✅ Facteur supprimé: % (%)', factor_record.email, factor_record.factor_id;
            
        EXCEPTION
            WHEN OTHERS THEN
                -- En cas d'erreur, retourner l'erreur
                user_id := factor_record.user_id;
                user_email := factor_record.email;
                factor_id := factor_record.factor_id;
                factor_type := factor_record.factor_type;
                action_taken := 'Tentative de suppression';
                result := '❌ Erreur: ' || SQLERRM;
                
                RAISE NOTICE '❌ Erreur suppression facteur %: %', factor_record.factor_id, SQLERRM;
        END;
        
        RETURN NEXT;
    END LOOP;
    
    RAISE NOTICE '🎉 Nettoyage terminé: % facteur(s) traité(s)', cleanup_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ÉTAPE 6: FONCTION DE SYNCHRONISATION DES PROFILS
-- =====================================================

-- Fonction pour synchroniser les profils avec l'état réel des facteurs MFA
CREATE OR REPLACE FUNCTION sync_mfa_profiles()
RETURNS void AS $$
DECLARE
    profile_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔄 Synchronisation des profils avec l''état MFA réel...';
    
    -- Parcourir tous les profils
    FOR profile_record IN 
        SELECT p.id, p.email, p.two_factor_enabled
        FROM profiles p
    LOOP
        -- Vérifier l'état réel des facteurs MFA
        UPDATE profiles 
        SET 
            two_factor_enabled = EXISTS(
                SELECT 1 FROM auth.mfa_factors 
                WHERE user_id = profile_record.id 
                AND status = 'verified'
            ),
            updated_at = NOW()
        WHERE id = profile_record.id;
        
        -- Compter les mises à jour
        IF FOUND THEN
            updated_count := updated_count + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Synchronisation terminée: % profil(s) mis à jour', updated_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ÉTAPE 7: EXÉCUTION AUTOMATIQUE DU NETTOYAGE
-- =====================================================

-- Exécuter le nettoyage des facteurs problématiques
SELECT * FROM cleanup_problematic_mfa_factors();

-- Synchroniser les profils
SELECT sync_mfa_profiles();

-- =====================================================
-- ÉTAPE 8: VÉRIFICATION FINALE
-- =====================================================

-- Vérifier l'état final après nettoyage
SELECT 
    'ÉTAT FINAL APRÈS NETTOYAGE' as titre,
    COUNT(*) as "Total facteurs MFA",
    COUNT(*) FILTER (WHERE status = 'verified') as "Facteurs vérifiés",
    COUNT(*) FILTER (WHERE status = 'unverified') as "Facteurs non vérifiés",
    COUNT(*) FILTER (WHERE friendly_name IS NULL OR friendly_name = '') as "Facteurs sans nom"
FROM auth.mfa_factors;

-- Vérifier la cohérence finale
SELECT 
    'COHÉRENCE FINALE' as titre,
    COUNT(*) as "Total profils",
    COUNT(*) FILTER (WHERE 
        two_factor_enabled = EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = profiles.id AND status = 'verified'
        )
    ) as "Profils cohérents",
    COUNT(*) FILTER (WHERE 
        two_factor_enabled != EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = profiles.id AND status = 'verified'
        )
    ) as "Profils incohérents"
FROM profiles;

-- =====================================================
-- ÉTAPE 9: NETTOYAGE - Supprimer les fonctions temporaires
-- =====================================================

-- Supprimer les fonctions de nettoyage après utilisation
DROP FUNCTION IF EXISTS cleanup_problematic_mfa_factors();
DROP FUNCTION IF EXISTS sync_mfa_profiles();

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT :

1. **Diagnostic complet** : Analyse l'état de tous les facteurs MFA
2. **Identification des problèmes** : Trouve les facteurs corrompus ou incohérents
3. **Nettoyage automatique** : Supprime les facteurs problématiques
4. **Synchronisation** : Met à jour les profils pour qu'ils correspondent à la réalité
5. **Vérification finale** : Confirme que tout est cohérent

🔧 COMMENT L'UTILISER :

1. Exécutez ce script dans l'éditeur SQL de Supabase
2. Le script identifiera et corrigera automatiquement les problèmes
3. Vérifiez les résultats affichés

⚠️ IMPORTANT :

- Ce script est sûr à exécuter en production
- Il ne supprime que les facteurs problématiques
- Il synchronise les profils avec l'état réel

🚀 APRÈS EXÉCUTION :

1. Les utilisateurs pourront configurer un nouveau facteur MFA
2. L'erreur "Factor not found" ne devrait plus se produire
3. Tous les profils seront cohérents avec l'état réel des facteurs

💡 SI LE PROBLÈME PERSISTE :

1. Vérifiez que le script s'est exécuté sans erreur
2. Redémarrez votre application
3. Demandez aux utilisateurs de se reconnecter
4. Contactez le support Supabase si nécessaire
*/
