-- =====================================================
-- SCRIPT POUR CORRIGER LES INCOHÉRENCES DANS LA TABLE PROFILES
-- =====================================================

-- ID de l'utilisateur Lucie
DO $$
DECLARE
    user_id UUID := 'e2143066-6067-4af5-90d3-beca62b46f76';
    user_email TEXT := 'lucie.perez90@gmail.com';
    current_email_verified BOOLEAN;
    current_two_factor_enabled BOOLEAN;
    auth_email_verified BOOLEAN;
    has_verified_factors BOOLEAN;
BEGIN
    RAISE NOTICE '🔍 Correction des incohérences pour: %', user_email;
    
    -- Récupérer les valeurs actuelles dans profiles
    SELECT email_verified, two_factor_enabled 
    INTO current_email_verified, current_two_factor_enabled
    FROM profiles 
    WHERE id = user_id;
    
    RAISE NOTICE '📋 État actuel dans profiles:';
    RAISE NOTICE '   - email_verified: %', current_email_verified;
    RAISE NOTICE '   - two_factor_enabled: %', current_two_factor_enabled;
    
    -- Vérifier l'état réel dans auth.users
    SELECT email_confirmed_at IS NOT NULL INTO auth_email_verified
    FROM auth.users 
    WHERE id = user_id;
    
    RAISE NOTICE '📋 État réel dans auth.users:';
    RAISE NOTICE '   - email_verified: %', auth_email_verified;
    
    -- Vérifier les facteurs 2FA
    SELECT EXISTS(
        SELECT 1 FROM auth.mfa_factors 
        WHERE user_id = fix_profile_inconsistencies.user_id 
        AND status = 'verified'
    ) INTO has_verified_factors;
    
    RAISE NOTICE '📋 État 2FA réel:';
    RAISE NOTICE '   - facteurs vérifiés: %', has_verified_factors;
    
    -- Corriger les incohérences
    UPDATE profiles 
    SET 
        email_verified = auth_email_verified,
        two_factor_enabled = has_verified_factors,
        updated_at = NOW()
    WHERE id = fix_profile_inconsistencies.user_id;
    
    RAISE NOTICE '✅ Profil mis à jour avec les valeurs correctes';
    
    -- Vérifier les nouvelles valeurs
    SELECT email_verified, two_factor_enabled 
    INTO current_email_verified, current_two_factor_enabled
    FROM profiles 
    WHERE id = fix_profile_inconsistencies.user_id;
    
    RAISE NOTICE '📋 Nouvel état dans profiles:';
    RAISE NOTICE '   - email_verified: %', current_email_verified;
    RAISE NOTICE '   - two_factor_enabled: %', current_two_factor_enabled;
    
END $$;

-- Afficher tous les profils avec leurs états
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.email_verified as profile_email_verified,
    p.two_factor_enabled as profile_2fa_enabled,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN TRUE 
        ELSE FALSE 
    END as auth_email_verified,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = p.id AND status = 'verified'
        ) THEN TRUE 
        ELSE FALSE 
    END as auth_2fa_enabled,
    CASE 
        WHEN p.email_verified = (u.email_confirmed_at IS NOT NULL) 
        AND p.two_factor_enabled = EXISTS(
            SELECT 1 FROM auth.mfa_factors 
            WHERE user_id = p.id AND status = 'verified'
        ) THEN '✅ Cohérent'
        ELSE '❌ Incohérent'
    END as consistency_status
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- Fonction pour synchroniser automatiquement tous les profils
CREATE OR REPLACE FUNCTION sync_profile_status()
RETURNS void AS $$
DECLARE
    profile_record RECORD;
BEGIN
    RAISE NOTICE '🔄 Synchronisation de tous les profils...';
    
    FOR profile_record IN 
        SELECT p.id, p.email
        FROM profiles p
    LOOP
        -- Mettre à jour email_verified
        UPDATE profiles 
        SET email_verified = (
            SELECT email_confirmed_at IS NOT NULL 
            FROM auth.users 
            WHERE id = profile_record.id
        )
        WHERE id = profile_record.id;
        
        -- Mettre à jour two_factor_enabled
        UPDATE profiles 
        SET two_factor_enabled = (
            SELECT EXISTS(
                SELECT 1 FROM auth.mfa_factors 
                WHERE user_id = profile_record.id 
                AND status = 'verified'
            )
        )
        WHERE id = profile_record.id;
        
        RAISE NOTICE '✅ Profil synchronisé: %', profile_record.email;
    END LOOP;
    
    RAISE NOTICE '🎉 Synchronisation terminée!';
END;
$$ LANGUAGE plpgsql;

-- Exécuter la synchronisation
SELECT sync_profile_status();

-- Vérifier le résultat final
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.email_verified,
    p.two_factor_enabled,
    p.updated_at
FROM profiles p
ORDER BY p.updated_at DESC;

-- Test d'accès au profil après correction
DO $$
DECLARE
    test_user_id UUID := 'e2143066-6067-4af5-90d3-beca62b46f76';
    profile_data RECORD;
BEGIN
    RAISE NOTICE '🧪 Test d''accès au profil après correction...';
    
    SELECT * INTO profile_data FROM profiles WHERE id = test_user_id;
    
    IF FOUND THEN
        RAISE NOTICE '✅ Accès réussi:';
        RAISE NOTICE '   - Email: %', profile_data.email;
        RAISE NOTICE '   - Email vérifié: %', profile_data.email_verified;
        RAISE NOTICE '   - 2FA activé: %', profile_data.two_factor_enabled;
        RAISE NOTICE '   - Rôle: %', profile_data.role;
    ELSE
        RAISE NOTICE '❌ Accès échoué: profil non trouvé';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur lors de l''accès: %', SQLERRM;
END $$;

-- Messages de fin
DO $$
BEGIN
    RAISE NOTICE '🔧 CORRECTION TERMINÉE';
    RAISE NOTICE '✅ Les incohérences ont été corrigées';
    RAISE NOTICE '💡 Essayez maintenant d''accéder à /profile';
    RAISE NOTICE '🔄 La fonction sync_profile_status() est disponible pour les futures synchronisations';
END $$;
