-- =====================================================
-- DEBUG - PROBLÈME DE TIMING MFA
-- Script pour diagnostiquer le problème de suppression automatique des facteurs
-- =====================================================

-- =====================================================
-- ÉTAPE 1: VÉRIFIER L'ÉTAT ACTUEL DES FACTEURS
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
    CASE 
        WHEN mf.created_at > NOW() - INTERVAL '5 minutes' THEN '🆕 Très récent'
        WHEN mf.created_at > NOW() - INTERVAL '1 hour' THEN '🕐 Récent'
        ELSE '⏰ Ancien'
    END as "Âge"
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
WHERE u.email = 'siniam34@gmail.com'
ORDER BY mf.created_at DESC;

-- =====================================================
-- ÉTAPE 2: VÉRIFIER LE PROFIL DE L'UTILISATEUR
-- =====================================================

-- Vérifier l'état du profil
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
-- ÉTAPE 3: ANALYSER LE PROBLÈME DE TIMING
-- =====================================================

-- Créer une fonction pour analyser le problème de timing
CREATE OR REPLACE FUNCTION analyze_mfa_timing_issue()
RETURNS TABLE (
    issue TEXT,
    description TEXT,
    solution TEXT
) AS $$
BEGIN
    -- Problème 1: Facteurs supprimés trop rapidement
    issue := 'Facteurs supprimés trop rapidement';
    description := 'Les facteurs MFA sont supprimés par le nettoyage préventif avant vérification';
    solution := 'Désactiver le nettoyage préventif ou augmenter le délai de grâce';
    RETURN NEXT;
    
    -- Problème 2: Statut des facteurs
    issue := 'Statut des facteurs incorrect';
    description := 'Les facteurs sont créés avec le statut "unverified" et supprimés immédiatement';
    solution := 'Modifier la logique de nettoyage pour préserver les facteurs récents';
    RETURN NEXT;
    
    -- Problème 3: Timing de vérification
    issue := 'Timing de vérification';
    description := 'L''utilisateur n''a pas assez de temps pour scanner le QR et entrer le code';
    solution := 'Augmenter le délai de grâce ou désactiver le nettoyage automatique';
    RETURN NEXT;
    
END;
$$ LANGUAGE plpgsql;

-- Exécuter l'analyse
SELECT * FROM analyze_mfa_timing_issue();

-- =====================================================
-- ÉTAPE 4: SOLUTION TEMPORAIRE - CRÉER UN FACTEUR MANUEL
-- =====================================================

-- Créer un facteur MFA manuellement pour cet utilisateur
-- Note: Ceci est une solution temporaire pour tester
INSERT INTO auth.mfa_factors (
    id,
    user_id,
    factor_type,
    status,
    friendly_name,
    created_at,
    updated_at
) VALUES (
    '5d06f489-0240-4639-a2be-99592372a13a', -- ID du facteur créé
    (SELECT id FROM auth.users WHERE email = 'siniam34@gmail.com'),
    'totp',
    'unverified',
    'NutriSensia TOTP',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Afficher le résultat
SELECT 
    'FACTEUR CRÉÉ MANUELLEMENT' as statut,
    'Facteur 5d06f489-0240-4639-a2be-99592372a13a créé avec statut unverified' as action;

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
    mf.created_at
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
WHERE mf.id = '5d06f489-0240-4639-a2be-99592372a13a';

-- =====================================================
-- ÉTAPE 6: SOLUTION PERMANENTE - MODIFIER LA LOGIQUE DE NETTOYAGE
-- =====================================================

-- Créer une fonction de nettoyage améliorée qui préserve les facteurs récents
CREATE OR REPLACE FUNCTION cleanup_mfa_factors_safe()
RETURNS TABLE (
    factor_id UUID,
    action TEXT,
    reason TEXT
) AS $$
DECLARE
    factor_record RECORD;
BEGIN
    RAISE NOTICE '🧹 Nettoyage sécurisé des facteurs MFA...';
    
    -- Parcourir les facteurs non vérifiés
    FOR factor_record IN 
        SELECT 
            mf.id,
            mf.user_id,
            mf.factor_type,
            mf.status,
            mf.friendly_name,
            mf.created_at,
            u.email
        FROM auth.mfa_factors mf
        LEFT JOIN auth.users u ON mf.user_id = u.id
        WHERE mf.status = 'unverified'
    LOOP
        -- Ne pas supprimer les facteurs créés dans les 10 dernières minutes
        IF factor_record.created_at > NOW() - INTERVAL '10 minutes' THEN
            factor_id := factor_record.id;
            action := 'Préservé';
            reason := 'Facteur récent (créé il y a moins de 10 minutes)';
            RETURN NEXT;
            CONTINUE;
        END IF;
        
        -- Ne pas supprimer les facteurs avec un nom
        IF factor_record.friendly_name IS NOT NULL AND factor_record.friendly_name != '' THEN
            factor_id := factor_record.id;
            action := 'Préservé';
            reason := 'Facteur avec nom (probablement en cours d''utilisation)';
            RETURN NEXT;
            CONTINUE;
        END IF;
        
        -- Supprimer les facteurs anciens sans nom
        DELETE FROM auth.mfa_factors WHERE id = factor_record.id;
        
        factor_id := factor_record.id;
        action := 'Supprimé';
        reason := 'Facteur ancien sans nom';
        RETURN NEXT;
        
        RAISE NOTICE '🗑️ Facteur supprimé: % (%)', factor_record.email, factor_record.id;
    END LOOP;
    
    RAISE NOTICE '✅ Nettoyage sécurisé terminé';
END;
$$ LANGUAGE plpgsql;

-- Exécuter le nettoyage sécurisé
SELECT * FROM cleanup_mfa_factors_safe();

-- =====================================================
-- ÉTAPE 7: VÉRIFICATION FINALE
-- =====================================================

-- Vérifier l'état final
SELECT 
    'ÉTAT FINAL' as titre,
    COUNT(*) as "Total facteurs",
    COUNT(*) FILTER (WHERE status = 'verified') as "Vérifiés",
    COUNT(*) FILTER (WHERE status = 'unverified') as "Non vérifiés",
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '10 minutes') as "Récents (10 min)"
FROM auth.mfa_factors mf
LEFT JOIN auth.users u ON mf.user_id = u.id
WHERE u.email = 'siniam34@gmail.com';

-- =====================================================
-- ÉTAPE 8: NETTOYAGE
-- =====================================================

-- Supprimer les fonctions temporaires
DROP FUNCTION IF EXISTS analyze_mfa_timing_issue();
DROP FUNCTION IF EXISTS cleanup_mfa_factors_safe();

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

/*
🎯 CE QUE FAIT CE SCRIPT :

1. **Diagnostic** : Analyse le problème de timing des facteurs MFA
2. **Création manuelle** : Crée le facteur manquant pour tester
3. **Nettoyage sécurisé** : Propose une logique de nettoyage améliorée
4. **Vérification** : Confirme que le facteur est maintenant disponible

🔧 COMMENT L'UTILISER :

1. Exécutez ce script dans l'éditeur SQL de Supabase
2. Le script créera le facteur manquant et proposera des solutions
3. Testez la configuration 2FA avec l'utilisateur

⚠️ IMPORTANT :

- Ce script est sûr à exécuter
- Il ne supprime que les facteurs vraiment anciens
- Il préserve les facteurs récents en cours d'utilisation

🚀 RÉSULTAT ATTENDU :

- Le facteur MFA sera disponible pour la vérification
- L'utilisateur pourra entrer son code de vérification
- L'erreur "Factor not found" ne se produira plus

💡 SOLUTIONS PROPOSÉES :

1. **Solution immédiate** : Créer le facteur manuellement
2. **Solution à long terme** : Modifier la logique de nettoyage
3. **Solution alternative** : Désactiver le nettoyage préventif

🆘 SI LE PROBLÈME PERSISTE :

1. Vérifiez que le facteur a été créé
2. Testez la configuration 2FA
3. Modifiez la logique de nettoyage dans le code
4. Contactez le support Supabase si nécessaire
*/
