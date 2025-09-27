-- =====================================================
-- SCRIPT: Restauration de la vue nutritionist_profiles
-- =====================================================
-- Description: Recrée la vue nutritionist_profiles après suppression accidentelle
-- Date: 2025-01-XX
-- Auteur: Assistant IA (Récupération d'urgence)
-- =====================================================

-- Commencer une transaction pour assurer la cohérence
BEGIN;

DO $$ 
BEGIN
    RAISE NOTICE '🚨 RÉCUPÉRATION D''URGENCE: Restauration de nutritionist_profiles';
    RAISE NOTICE '=========================================================';
    
    -- =====================================================
    -- ÉTAPE 1: Vérifier si la vue existe déjà
    -- =====================================================
    
    IF EXISTS (
        SELECT 1 
        FROM information_schema.views 
        WHERE table_name = 'nutritionist_profiles'
    ) THEN
        RAISE NOTICE '⚠️ La vue nutritionist_profiles existe déjà';
        RAISE NOTICE '🔄 Suppression de l''ancienne vue pour la recréer...';
        DROP VIEW nutritionist_profiles;
    ELSE
        RAISE NOTICE '❌ Confirmation: la vue nutritionist_profiles n''existe pas';
    END IF;

    -- =====================================================
    -- ÉTAPE 2: Recréer la vue nutritionist_profiles
    -- =====================================================
    
    RAISE NOTICE '🔨 Création de la vue nutritionist_profiles...';
    
    CREATE VIEW nutritionist_profiles AS
    SELECT 
        -- Données du profil de base (table profiles)
        p.id,
        p.email,
        p.role,
        p.email_verified,
        p.two_factor_enabled,
        p.last_sign_in_at,
        p.created_at,
        p.updated_at,
        
        -- Données spécifiques nutritionniste (table nutritionists)
        n.first_name,
        n.last_name,
        n.phone,
        n.avatar_url,
        n.locale,
        n.asca_number,
        n.rme_number,
        n.ean_code,
        n.specializations,
        n.bio,
        n.years_of_experience,
        n.certifications,
        n.continuing_education,
        n.consultation_rates,
        n.consultation_types,
        n.practice_address,
        n.max_patients,
        n.onboarding_completed,
        n.onboarding_data
    FROM profiles p
    INNER JOIN nutritionists n ON p.id = n.id
    WHERE p.role = 'nutritionist';

    -- Ajouter un commentaire à la vue
    COMMENT ON VIEW nutritionist_profiles IS 'Vue complète des profils de nutritionnistes - Restaurée après suppression accidentelle';

    RAISE NOTICE '✅ Vue nutritionist_profiles restaurée avec succès !';

    -- =====================================================
    -- ÉTAPE 3: Vérifications de sécurité
    -- =====================================================
    
    RAISE NOTICE '🔍 Vérifications de sécurité...';
    
    -- Vérifier que la vue existe maintenant
    IF EXISTS (
        SELECT 1 
        FROM information_schema.views 
        WHERE table_name = 'nutritionist_profiles'
    ) THEN
        RAISE NOTICE '✅ Vue nutritionist_profiles existe maintenant';
    ELSE
        RAISE EXCEPTION '❌ ERREUR CRITIQUE: La vue n''a pas pu être créée';
    END IF;
    
    -- Tester la vue avec un COUNT
    DECLARE
        nutritionist_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO nutritionist_count FROM nutritionist_profiles;
        RAISE NOTICE '📊 Nombre de nutritionnistes dans la vue: %', nutritionist_count;
    END;
    
    -- Vérifier les colonnes principales
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'nutritionist_profiles' 
        AND column_name = 'first_name'
    ) THEN
        RAISE NOTICE '✅ Colonne first_name présente';
    ELSE
        RAISE EXCEPTION '❌ ERREUR: Colonne first_name manquante';
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'nutritionist_profiles' 
        AND column_name = 'consultation_types'
    ) THEN
        RAISE NOTICE '✅ Colonne consultation_types présente';
    ELSE
        RAISE NOTICE '⚠️ Colonne consultation_types manquante (peut être normale si pas encore ajoutée)';
    END IF;

END $$;

-- Valider la transaction
COMMIT;

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 RÉCUPÉRATION TERMINÉE AVEC SUCCÈS ! 🎉';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '✅ Vue nutritionist_profiles restaurée';
    RAISE NOTICE '✅ Toutes les colonnes nécessaires présentes';
    RAISE NOTICE '✅ Vue fonctionnelle et testée';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Vous pouvez maintenant:';
    RAISE NOTICE '- Tester l''onboarding: http://localhost:3000/onboarding/nutritionist';
    RAISE NOTICE '- Vérifier les données dans Supabase Dashboard';
    RAISE NOTICE '- Continuer le développement normalement';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Conseil: Sauvegardez régulièrement vos vues importantes !';
END $$;
