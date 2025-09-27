-- Ajout de la colonne consultation_types à la table nutritionists
-- Cette colonne stockera les types de consultation proposés par chaque nutritionniste

DO $$ 
BEGIN
    -- Vérifier si la colonne n'existe pas déjà
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nutritionists' 
        AND column_name = 'consultation_types'
    ) THEN
        -- Ajouter la colonne consultation_types
        ALTER TABLE nutritionists 
        ADD COLUMN consultation_types JSONB DEFAULT '["initial", "suivi", "express"]'::jsonb;
        
        RAISE NOTICE '✅ Colonne consultation_types ajoutée avec succès';
    ELSE
        RAISE NOTICE 'ℹ️  La colonne consultation_types existe déjà';
    END IF;
    
    -- Mettre à jour les nutritionnistes existants avec des valeurs par défaut
    UPDATE nutritionists 
    SET consultation_types = '["initial", "suivi", "express"]'::jsonb
    WHERE consultation_types IS NULL;
    
    RAISE NOTICE '✅ Données par défaut appliquées aux nutritionnistes existants';
    
END $$;

-- Ajouter un commentaire à la colonne
COMMENT ON COLUMN nutritionists.consultation_types IS 'Types de consultation proposés par le nutritionniste (initial, suivi, express, groupe, etc.)';

-- Supprimer et recréer la vue nutritionist_profiles pour inclure consultation_types
DROP VIEW IF EXISTS nutritionist_profiles;

CREATE VIEW nutritionist_profiles AS
SELECT 
    -- Données d'authentification (de profiles)
    p.id,
    p.email,
    p.role,
    p.email_verified,
    p.two_factor_enabled,
    p.last_sign_in_at,
    
    -- Données professionnelles (de nutritionists)
    n.first_name,
    n.last_name,
    n.phone,
    n.avatar_url,
    n.locale,
    n.timezone,
    n.asca_number,
    n.rme_number,
    n.ean_code,
    n.specializations,
    n.bio,
    n.consultation_rates,
    n.consultation_types,  -- ✅ NOUVELLE COLONNE
    n.practice_address,
    n.verified,
    n.is_active,
    n.max_patients,
    n.profile_public,
    n.allow_contact,
    n.notification_preferences,
    n.onboarding_completed,
    n.onboarding_completed_at,
    n.created_at,
    n.updated_at
FROM profiles p
INNER JOIN nutritionists n ON p.id = n.id
WHERE p.role = 'nutritionist';

-- Ajouter un commentaire à la vue mise à jour
COMMENT ON VIEW nutritionist_profiles IS 'Vue combinée des profils nutritionnistes avec données auth et professionnelles (incluant consultation_types)';

-- Vérification finale
SELECT 
    'nutritionists' as table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'nutritionists' 
AND column_name = 'consultation_types';

-- Test de la vue mise à jour
DO $$
BEGIN
    RAISE NOTICE '🎉 Colonne consultation_types ajoutée avec succès !';
    RAISE NOTICE '✅ Vue nutritionist_profiles mise à jour';
    RAISE NOTICE '✅ Types par défaut: ["initial", "suivi", "express"]';
    RAISE NOTICE '📊 Vérification finale en cours...';
END $$;

-- Test de la vue mise à jour
SELECT 
    id,
    email,
    first_name,
    consultation_types,
    consultation_rates
FROM nutritionist_profiles 
LIMIT 3;
