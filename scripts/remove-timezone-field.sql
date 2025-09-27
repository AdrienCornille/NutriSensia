-- =====================================================
-- SCRIPT: Suppression du champ timezone
-- =====================================================
-- Description: Supprime le champ timezone de la table nutritionists 
-- et met à jour la vue nutritionist_profiles en conséquence
-- Date: 2025-01-XX
-- Auteur: Assistant IA
-- =====================================================

-- Commencer une transaction pour assurer la cohérence
BEGIN;

DO $$ 
BEGIN
    -- =====================================================
    -- ÉTAPE 1: Vérifier l'existence de la colonne timezone
    -- =====================================================
    
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'nutritionists' 
        AND column_name = 'timezone'
    ) THEN
        RAISE NOTICE '🔍 Colonne timezone trouvée dans la table nutritionists';
        
        -- =====================================================
        -- ÉTAPE 2: Supprimer la colonne timezone de nutritionists
        -- =====================================================
        
        RAISE NOTICE '🗑️ Suppression de la colonne timezone...';
        ALTER TABLE nutritionists DROP COLUMN IF EXISTS timezone;
        RAISE NOTICE '✅ Colonne timezone supprimée de la table nutritionists';
        
    ELSE
        RAISE NOTICE '⚠️ La colonne timezone n''existe pas dans la table nutritionists';
    END IF;

    -- =====================================================
    -- ÉTAPE 3: Mettre à jour la vue nutritionist_profiles
    -- =====================================================
    
    RAISE NOTICE '🔄 Mise à jour de la vue nutritionist_profiles...';
    
    -- Supprimer la vue existante
    DROP VIEW IF EXISTS nutritionist_profiles;
    
    -- Recréer la vue sans le champ timezone
    CREATE VIEW nutritionist_profiles AS
    SELECT 
        p.id,
        p.email,
        p.role,
        p.email_verified,
        p.two_factor_enabled,
        p.last_sign_in_at,
        p.created_at,
        p.updated_at,
        n.first_name,
        n.last_name,
        n.phone,
        n.avatar_url,
        n.locale,
        -- timezone supprimé ici
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
    COMMENT ON VIEW nutritionist_profiles IS 'Vue complète des profils de nutritionnistes (sans timezone)';

    RAISE NOTICE '✅ Vue nutritionist_profiles mise à jour sans le champ timezone';

    -- =====================================================
    -- ÉTAPE 4: Vérification finale
    -- =====================================================
    
    RAISE NOTICE '🔍 Vérification de la structure mise à jour...';
    
    -- Vérifier que la colonne timezone n'existe plus
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'nutritionists' 
        AND column_name = 'timezone'
    ) THEN
        RAISE NOTICE '✅ Confirmation: colonne timezone supprimée avec succès';
    ELSE
        RAISE EXCEPTION '❌ Erreur: la colonne timezone existe encore';
    END IF;
    
    -- Vérifier que la vue fonctionne
    PERFORM COUNT(*) FROM nutritionist_profiles;
    RAISE NOTICE '✅ Vue nutritionist_profiles fonctionne correctement';
    
END $$;

-- Valider la transaction
COMMIT;

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SUPPRESSION DU TIMEZONE TERMINÉE AVEC SUCCÈS ! 🎉';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '✅ Colonne timezone supprimée de nutritionists';
    RAISE NOTICE '✅ Vue nutritionist_profiles mise à jour';
    RAISE NOTICE '✅ Base de données optimisée';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Prochaines étapes:';
    RAISE NOTICE '- Mettre à jour le code application pour ne plus utiliser timezone';
    RAISE NOTICE '- Tester l''onboarding sans le champ timezone';
    RAISE NOTICE '';
END $$;
